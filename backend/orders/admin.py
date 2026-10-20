from django.contrib import admin
from django import forms
from django.db import models
from .models import Cart, Order, OrderItem, Payment
from .email_utils import send_order_delivered_email


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    fields = ('product', 'price', 'quantity', 'subtotal', 'your_product')
    readonly_fields = ('product', 'price', 'quantity', 'subtotal')  # ✅ subtotal is property
    formfield_overrides = {
        models.TextField: {'widget': forms.Textarea(attrs={'rows': 2, 'cols': 40, 'placeholder': 'Credentials, key, or product details...'})},
    }

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
    list_display       = ('order_number', 'user', 'status', 'total_amount', 'profit', 'created_at')
    list_editable      = ('profit',)
    list_display_links = ('order_number',)
    list_filter        = ('status',)
    search_fields      = ('order_number', 'user__email')
    inlines            = [OrderItemInline, PaymentInline]
    readonly_fields    = ('order_number', 'total_amount', 'created_at', 'updated_at')
    fields             = ('order_number', 'user', 'status', 'total_amount', 'profit', 'your_order', 'created_at', 'updated_at')
    actions            = ['mark_as_paid']
    formfield_overrides = {
        models.TextField: {'widget': forms.Textarea(attrs={'rows': 3, 'cols': 70, 'placeholder': 'General order delivery notes / access details shown to user when status is Paid...'})},
    }

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        old_status = form.initial.get('status')
        new_status = form.cleaned_data.get('status')
        if old_status != 'paid' and new_status == 'paid':
            if hasattr(form.instance, 'payment') and form.instance.payment:
                form.instance.payment.status = 'success'
                form.instance.payment.save(update_fields=['status'])
            email_sent = send_order_delivered_email(form.instance)
            if email_sent:
                self.message_user(request, f"Order #{form.instance.order_number} marked as Paid and delivery email sent to {form.instance.user.email}!")
            else:
                self.message_user(request, f"Order #{form.instance.order_number} marked as Paid. (Note: Email was not sent; check RESEND_API_KEY / server logs).", level='warning')

    @admin.action(description="Mark selected orders as Paid & send delivery email")
    def mark_as_paid(self, request, queryset):
        count = 0
        for order in queryset:
            if order.status != 'paid':
                order.status = 'paid'
                order.save(update_fields=['status'])
                if hasattr(order, 'payment') and order.payment:
                    order.payment.status = 'success'
                    order.payment.save(update_fields=['status'])
                send_order_delivered_email(order)
                count += 1
        self.message_user(request, f"{count} order(s) marked as Paid and delivery email sent.")


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
    actions       = ['mark_as_success']

    def save_model(self, request, obj, form, change):
        old_status = form.initial.get('status')
        new_status = form.cleaned_data.get('status')
        super().save_model(request, obj, form, change)
        if old_status not in ('success', 'paid') and new_status in ('success', 'paid'):
            if obj.order and obj.order.status != 'paid':
                obj.order.status = 'paid'
                obj.order.save(update_fields=['status'])
                email_sent = send_order_delivered_email(obj.order)
                if email_sent:
                    self.message_user(request, f"Payment marked as Success and delivery email sent to {obj.order.user.email}!")

    @admin.action(description="Mark selected payments as Success & send delivery email")
    def mark_as_success(self, request, queryset):
        count = 0
        for payment in queryset:
            if payment.status != 'success':
                payment.status = 'success'
                payment.save(update_fields=['status'])
                if payment.order and payment.order.status != 'paid':
                    payment.order.status = 'paid'
                    payment.order.save(update_fields=['status'])
                    send_order_delivered_email(payment.order)
                count += 1
        self.message_user(request, f"{count} payment(s) marked as Success and delivery email sent.")
