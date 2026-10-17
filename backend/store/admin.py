from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ('image_preview', 'name', 'slug', 'icon')
    list_display_links = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('image_preview_large',)

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width:44px;height:44px;object-fit:cover;border-radius:8px;border:1px solid #ddd;" />',
                obj.image.url
            )
        if obj.icon:
            return format_html('<span style="font-size:28px">{}</span>', obj.icon)
        return format_html('<span style="color:#999">No image</span>')
    image_preview.short_description = "Image / Icon"

    def image_preview_large(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width:200px;max-height:200px;object-fit:contain;border-radius:8px;border:1px solid #ddd;" />',
                obj.image.url
            )
        return "No image uploaded yet"
    image_preview_large.short_description = "Current Image Preview"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display   = ('image_preview', 'name', 'category', 'price', 'discounted_price', 'billing_cycle', 'is_active', 'is_featured')
    list_display_links = ('name',)
    list_filter    = ('category', 'billing_cycle', 'is_active', 'is_featured')
    search_fields  = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    list_editable  = ('price', 'discounted_price', 'is_active', 'is_featured')
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
