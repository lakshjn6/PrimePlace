from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name        = models.CharField(max_length=100, unique=True)
    slug        = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    icon        = models.CharField(max_length=50, blank=True,
                                   help_text="Emoji or icon class name")
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(models.Model):
    BILLING_CHOICES = [
    ('1_month', '1 Month'),
    ('2_months', '2 Months'),
    ('3_months', '3 Months'),
    ('4_months', '4 Months'),
    ('5_months', '5 Months'),
    ('6_months', '6 Months'),
    ('7_months', '7 Months'),
    ('8_months', '8 Months'),
    ('9_months', '9 Months'),
    ('10_months', '10 Months'),
    ('11_months', '11 Months'),
    ('yearly', 'Yearly'),
    ('24_months', '24 Months'),
    ('lifetime', 'Lifetime'),]

    category       = models.ForeignKey(Category, on_delete=models.CASCADE,
                                       related_name='products')
    name           = models.CharField(max_length=200)
    slug           = models.SlugField(max_length=220, unique=True, blank=True)
    description    = models.TextField()
    features       = models.JSONField(default=list,
                                      help_text='List of feature strings')
    price          = models.DecimalField(max_digits=10, decimal_places=2)
    billing_cycle  = models.CharField(max_length=20, choices=BILLING_CHOICES,
                                      default='monthly')
    image          = models.ImageField(upload_to='products/', blank=True, null=True)
    is_active      = models.BooleanField(default=True)
    is_featured    = models.BooleanField(default=False)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.name} ({self.category})"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
