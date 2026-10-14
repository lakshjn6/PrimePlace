from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ('name', 'slug', 'icon')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display   = ('image_preview', 'name', 'category', 'price', 'billing_cycle', 'is_active', 'is_featured')
    list_display_links = ('name',)
    list_filter    = ('category', 'billing_cycle', 'is_active', 'is_featured')
    search_fields  = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    list_editable  = ('is_active', 'is_featured')
    readonly_fields = ('image_preview_large',)

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd;" />',
                obj.image.url
            )
        return format_html('<span style="color: #999;">No image</span>')
    image_preview.short_description = "Photo"

    def image_preview_large(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 240px; max-height: 240px; object-fit: contain; border-radius: 8px; border: 1px solid #ddd;" />',
                obj.image.url
            )
        return "No image uploaded yet"
    image_preview_large.short_description = "Current Image Preview"
