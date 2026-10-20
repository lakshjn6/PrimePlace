import uuid
from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404

from .models import Cart, Order, OrderItem, Payment
from .serializers import (CartSerializer, OrderSerializer,
                          CheckoutSerializer, PaymentSerializer)


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items    = Cart.objects.filter(user=request.user).select_related('product')
        total    = sum(i.subtotal for i in items)
        return Response({
            'items': CartSerializer(items, many=True, context={'request': request}).data,
            'total': total,
            'count': items.count(),
        })

    def post(self, request):
        """Add item to cart."""
        serializer = CartSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            item = serializer.save()
            return Response(CartSerializer(item, context={'request': request}).data,
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        """Clear entire cart."""
        Cart.objects.filter(user=request.user).delete()
        return Response({'message': 'Cart cleared.'})


class CartItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, item_id):
        item     = get_object_or_404(Cart, id=item_id, user=request.user)
        quantity = request.data.get('quantity', 1)
        if quantity < 1:
            item.delete()
            return Response({'message': 'Item removed.'})
        item.quantity = quantity
        item.save()
        return Response(CartSerializer(item, context={'request': request}).data)

    def delete(self, request, item_id):
        item = get_object_or_404(Cart, id=item_id, user=request.user)
        item.delete()
        return Response({'message': 'Item removed.'})


class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        cart_items = Cart.objects.filter(user=request.user).select_related('product')
        if not cart_items.exists():
            return Response({'error': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        total = sum(item.subtotal for item in cart_items)

        # Create order
        order_number = f"SF-{uuid.uuid4().hex[:10].upper()}"
        order = Order.objects.create(
            user=request.user,
            order_number=order_number,
            total_amount=total,
            status='pending',
        )

        # Create order items
        for cart_item in cart_items:
            if cart_item.has_discount and cart_item.quantity > 1:
                # 1 item at special offer price
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    quantity=1,
                    price=cart_item.product.discounted_price,
                )
                # Remaining items at regular product price
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    quantity=cart_item.quantity - 1,
                    price=cart_item.product.price,
                )
            else:
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    quantity=cart_item.quantity,
                    price=cart_item.effective_price,
                )

        # Create payment record
        data = serializer.validated_data
        screenshot = data.get('payment_screenshot')

        # Ensure transaction_ref is unique even if welcome-customer-{id} was reused
        transaction_ref = data['transaction_ref']
        if Payment.objects.filter(transaction_ref=transaction_ref).exists():
            transaction_ref = f"{transaction_ref}-{uuid.uuid4().hex[:6]}"

        payment = Payment.objects.create(
            order=order,
            user=request.user,
            payer_name=data['payer_name'],
            payer_email=data['payer_email'],
            transaction_ref=transaction_ref,
            amount=total,
            payment_method=data.get('payment_method', 'bank_transfer'),
            notes=data.get('notes', ''),
            status='pending',
        )

        # Save screenshot separately so Django's storage backend (Cloudinary) processes it
        if screenshot:
            payment.payment_screenshot.save(screenshot.name, screenshot, save=True)

        # Mark order as paid
        order.status = 'pending'
        order.save()

        # Clear cart
        cart_items.delete()

        return Response({
            'message': 'Order placed successfully!',
            'order':   OrderSerializer(order).data,
        }, status=status.HTTP_201_CREATED)


class OrderListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.is_admin:
            orders = Order.objects.all().select_related('user').prefetch_related('items__product', 'payment')
        else:
            orders = Order.objects.filter(user=request.user).prefetch_related('items__product', 'payment')
        return Response(OrderSerializer(orders, many=True, context={'request': request}).data)


class OrderDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_number):
        if request.user.is_admin:
            order = get_object_or_404(Order, order_number=order_number)
        else:
            order = get_object_or_404(Order, order_number=order_number, user=request.user)
        return Response(OrderSerializer(order, context={'request': request}).data)

    def patch(self, request, order_number):
        if not request.user.is_admin:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        order = get_object_or_404(Order, order_number=order_number)

        if 'profit' in request.data:
            val = request.data.get('profit')
            if val in ('', None):
                order.profit = None
            else:
                try:
                    order.profit = Decimal(str(val))
                except Exception:
                    return Response({'error': 'Invalid profit amount.'}, status=status.HTTP_400_BAD_REQUEST)

        if 'your_order' in request.data:
            order.your_order = request.data.get('your_order', '')

        if 'status' in request.data:
            old_status = order.status
            new_status = request.data.get('status')
            order.status = new_status
            if old_status != 'paid' and new_status == 'paid':
                if hasattr(order, 'payment') and order.payment:
                    order.payment.status = 'success'
                    order.payment.save(update_fields=['status'])
                from .email_utils import send_order_delivered_email
                try:
                    send_order_delivered_email(order)
                except Exception as e:
                    print(f"Delivery email error: {e}")

        order.save()
        return Response(OrderSerializer(order, context={'request': request}).data)


class TrackOrderView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, order_number):
        clean_num = order_number.strip().upper()
        order = Order.objects.filter(order_number__iexact=clean_num).select_related('user').prefetch_related('items__product').first()
        if not order:
            return Response({'error': f'Order #{clean_num} not found. Please verify the order number.'}, status=status.HTTP_404_NOT_FOUND)

        item_names = [it.product.name for it in order.items.all() if it.product]
        
        return Response({
            'order_number': order.order_number,
            'status': order.status,
            'total_amount': str(order.total_amount),
            'items_count': order.items.count(),
            'products': item_names,
            'created_at': order.created_at,
            'has_delivered': order.status == 'paid',
        })


