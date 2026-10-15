from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    image_url     = serializers.SerializerMethodField()

    class Meta:
        model  = Category
        fields = ['id', 'name', 'slug', 'description', 'icon', 'image_url', 'product_count']

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()

    def get_image_url(self, obj):
        try:
            if not obj.image:
                return None
            url = obj.image.url
            if url.startswith('http://') or url.startswith('https://'):
                return url
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(url)
            from django.conf import settings
            backend_url = getattr(settings, 'BACKEND_URL', 'http://127.0.0.1:8000')
            return f"{backend_url.rstrip('/')}{url}"
        except Exception:
            return None


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    image_url     = serializers.SerializerMethodField() 

    class Meta:
        model  = Product
        fields = ['id', 'category', 'category_name', 'category_slug', 'category_icon',
                  'name', 'slug', 'description', 'features',
                  'price', 'billing_cycle', 'image_url', 'is_active',
                  'is_featured', 'created_at']
    
    def get_image_url(self, obj): 
        try:
            if not obj.image:
                return None
            url = obj.image.url
            if url.startswith('http://') or url.startswith('https://'):
                return url
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(url)
            from django.conf import settings
            backend_url = getattr(settings, 'BACKEND_URL', 'http://127.0.0.1:8000')
            return f"{backend_url.rstrip('/')}{url}"
        except Exception:
            return None
    

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be positive.")
        return value


class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Product
        fields = ['category', 'name', 'description', 'features',
                  'price', 'billing_cycle', 'image', 'is_active', 'is_featured']
