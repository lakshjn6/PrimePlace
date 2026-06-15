from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model  = Category
        fields = ['id', 'name', 'slug', 'description', 'icon', 'product_count']

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)

    class Meta:
        model  = Product
        fields = ['id', 'category', 'category_name', 'category_slug',
                  'name', 'slug', 'description', 'features',
                  'price', 'billing_cycle', 'image', 'is_active',
                  'is_featured', 'created_at']
    
    def get_image_url(self, obj):         
        if not obj.image:
            return None
        return obj.image.url       

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be positive.")
        return value


class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Product
        fields = ['category', 'name', 'description', 'features',
                  'price', 'billing_cycle', 'image', 'is_active', 'is_featured']
