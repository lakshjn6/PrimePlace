
from django.contrib import admin
from .models import SiteReview


@admin.register(SiteReview)
class SiteReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'rating', 'created_at', 'is_active']
    list_filter = ['rating', 'created_at', 'is_active']
    search_fields = ['user__first_name', 'message']
    readonly_fields = ['user', 'created_at', 'updated_at']
