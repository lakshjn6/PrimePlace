from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class SiteReview(models.Model):
    """Site-wide reviews (isolated app)"""
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='site_reviews'
    )
    message = models.TextField(max_length=1000)
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        default=5
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Site Review'
        verbose_name_plural = 'Site Reviews'
    
    def __str__(self):
        return f"{self.user.first_name} - {self.rating}★"
