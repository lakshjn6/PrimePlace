from rest_framework import serializers
from .models import Cart, Order, OrderItem, Payment
from store.serializers import ProductSerializer


class CartSerializer(serializers.ModelSerializer):
    product  = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    has_discount = serializers.BooleanField(read_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model  = Cart
        fields = ['id', 'product', 'product_id', 'quantity', 'effective_price', 'has_discount', 'subtotal', 'added_at']

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
    your_product  = serializers.SerializerMethodField()

    class Meta:
        model  = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'subtotal', 'your_product']

    def get_your_product(self, obj):
        request = self.context.get('request')
        is_admin = bool(request and request.user and getattr(request.user, 'is_admin', False))
        if (obj.order and obj.order.status == 'paid') or is_admin:
            return obj.your_product or ''
        return ''


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
    your_order = serializers.SerializerMethodField()
    profit     = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)

    class Meta:
        model  = Order
        fields = ['id', 'order_number', 'user_email', 'status',
                  'total_amount', 'profit', 'your_order', 'items', 'payment', 'created_at']

    def get_your_order(self, obj):
        request = self.context.get('request')
        is_admin = bool(request and request.user and getattr(request.user, 'is_admin', False))
        if obj.status == 'paid' or is_admin:
            return obj.your_order or ''
        return ''

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        is_admin = bool(request and request.user and getattr(request.user, 'is_admin', False))
        if not is_admin:
            data.pop('profit', None)
        return data


class CheckoutSerializer(serializers.Serializer):
    """Converts current cart to an order."""
    payer_name      = serializers.CharField(max_length=100)
    payer_email     = serializers.EmailField()
    transaction_ref = serializers.CharField(max_length=100)
    payment_method  = serializers.CharField(max_length=50, default='bank_transfer')
    payment_screenshot = serializers.ImageField(required=False)
    notes           = serializers.CharField(required=False, allow_blank=True)
