from django.contrib import admin
from .models import Cart, Order, OrderItem, Payment


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'price', 'quantity', 'subtotal')  # ✅ subtotal is property

    def subtotal(self, obj):
        if obj.price is None:
            return '₹0'
        return f'₹{obj.subtotal}'
    subtotal.short_description = 'Subtotal'


class PaymentInline(admin.StackedInline):
    model = Payment
    extra = 0
    readonly_fields = ('payer_name', 'payer_email', 'transaction_ref', 
                       'amount', 'payment_method', 'status', 'paid_at')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display    = ('order_number', 'user', 'status', 'total_amount', 'created_at')
    list_filter     = ('status',)
    search_fields   = ('order_number', 'user__email')
    inlines         = [OrderItemInline, PaymentInline]
    readonly_fields = ('order_number', 'total_amount', 'created_at', 'updated_at')


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'quantity', 'added_at')  # ✅ product exists in Cart model
    readonly_fields = ('added_at',)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display  = ('order', 'payer_name', 'amount', 'status', 'paid_at')
    list_filter   = ('status', 'payment_method')
    search_fields = ('transaction_ref', 'payer_email')
    readonly_fields = ('paid_at',)
