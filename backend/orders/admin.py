from django.contrib import admin
from .models import Cart, Order, OrderItem, Payment


class OrderItemInline(admin.TabularInline):
    model  = OrderItem
    extra  = 0
    readonly_fields = ('price', 'subtotal')


class PaymentInline(admin.StackedInline):
    model  = Payment
    extra  = 0
    readonly_fields = ('amount', 'paid_at')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display   = ('order_number', 'user', 'status', 'total_amount', 'created_at')
    list_filter    = ('status',)
    search_fields  = ('order_number', 'user__email')
    inlines        = [OrderItemInline, PaymentInline]
    readonly_fields = ('order_number', 'total_amount', 'created_at')


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'quantity', 'added_at')


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display  = ('order', 'payer_name', 'amount', 'status', 'paid_at')
    list_filter   = ('status', 'payment_method')
    search_fields = ('transaction_ref', 'payer_email')
