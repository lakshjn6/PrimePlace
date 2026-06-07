from rest_framework import serializers
from .models import Cart, Order, OrderItem, Payment
from store.serializers import ProductSerializer


class CartSerializer(serializers.ModelSerializer):
    product  = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model  = Cart
        fields = ['id', 'product', 'product_id', 'quantity', 'subtotal', 'added_at']

    def validate_product_id(self, value):
        from store.models import Product
        try:
            Product.objects.get(id=value, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found or inactive.")
        return value

    def create(self, validated_data):
        from store.models import Product
        product = Product.objects.get(id=validated_data.pop('product_id'))
        user    = self.context['request'].user
        cart_item, created = Cart.objects.get_or_create(
            user=user, product=product,
            defaults={'quantity': validated_data.get('quantity', 1)}
        )
        if not created:
            cart_item.quantity += validated_data.get('quantity', 1)
            cart_item.save()
        return cart_item


class OrderItemSerializer(serializers.ModelSerializer):
    product_name  = serializers.CharField(source='product.name', read_only=True)
    subtotal      = serializers.ReadOnlyField()

    class Meta:
        model  = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'subtotal']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Payment
        fields = ['id', 'payer_name', 'payer_email', 'transaction_ref',
                  'amount', 'payment_method', 'payment_screenshot',
                  'status', 'notes', 'paid_at']
        read_only_fields = ['id', 'status', 'paid_at', 'amount']


class OrderSerializer(serializers.ModelSerializer):
    items   = OrderItemSerializer(many=True, read_only=True)
    payment = PaymentSerializer(read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model  = Order
        fields = ['id', 'order_number', 'user_email', 'status',
                  'total_amount', 'items', 'payment', 'created_at']


class CheckoutSerializer(serializers.Serializer):
    """Converts current cart to an order."""
    payer_name      = serializers.CharField(max_length=100)
    payer_email     = serializers.EmailField()
    transaction_ref = serializers.CharField(max_length=100)
    payment_method  = serializers.CharField(max_length=50, default='bank_transfer')
    payment_screenshot = serializers.ImageField(required=False)
    notes           = serializers.CharField(required=False, allow_blank=True)
