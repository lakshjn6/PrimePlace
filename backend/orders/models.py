from django.db import models
from accounts.models import Account
from store.models import Product


class Cart(models.Model):
    user       = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='cart_items')
    product    = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity   = models.PositiveIntegerField(default=1)
    added_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')
        ordering = ['-added_at']

    def __str__(self):
        return f"{self.user.email} — {self.product.name} x{self.quantity}"

    @property
    def subtotal(self):
        return self.product.price * self.quantity


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending',    'Pending'),
        ('paid',       'Paid'),
        ('cancelled',  'Cancelled'),
        ('refunded',   'Refunded'),
    ]

    user         = models.ForeignKey(Account, on_delete=models.CASCADE,
                                     related_name='orders')
    order_number = models.CharField(max_length=30, unique=True)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES,
                                    default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.order_number} — {self.user.email}"


class OrderItem(models.Model):
    order    = models.ForeignKey(Order, on_delete=models.CASCADE,
                                 related_name='items')
    product  = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)
    price    = models.DecimalField(max_digits=10, decimal_places=2 , null=True)  # snapshot

    def __str__(self):
        return f"{self.order.order_number} — {self.product}"

    @property
    def subtotal(self):
        if self.price is None:
            return 0
        return self.price * self.quantity


class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending',  'Pending'),
        ('success',  'Success'),
        ('failed',   'Failed'),
    ]

    order            = models.OneToOneField(Order, on_delete=models.CASCADE,
                                            related_name='payment')
    user             = models.ForeignKey(Account, on_delete=models.CASCADE)
    # Basic payment details (no gateway)
    payer_name       = models.CharField(max_length=100)
    payer_email      = models.EmailField()
    transaction_ref  = models.CharField(max_length=100, unique=True)
    amount           = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method   = models.CharField(max_length=50, default='manual')
    payment_screenshot = models.ImageField(upload_to='payments/', blank=True, null=True)
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES,
                                        default='pending')
    notes            = models.TextField(blank=True)
    paid_at          = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment for {self.order.order_number} — {self.status}"
