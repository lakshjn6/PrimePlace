from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer, ProductCreateSerializer


class CategoryListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not request.user.is_authenticated or not request.user.is_admin:
            return Response({'error': 'Admin only.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        category = get_object_or_404(Category, slug=slug)
        products = Product.objects.filter(category=category, is_active=True)
        return Response({
            'category': CategorySerializer(category).data,
            'products': ProductSerializer(products, many=True,
                                          context={'request': request}).data,
        })


class ProductListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        qs = Product.objects.filter(is_active=True)
        category_slug = request.query_params.get('category')
        featured      = request.query_params.get('featured')
        if category_slug:
            qs = qs.filter(category__slug=category_slug)
        if featured == 'true':
            qs = qs.filter(is_featured=True)
        serializer = ProductSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        if not request.user.is_authenticated or not request.user.is_admin:
            return Response({'error': 'Admin only.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = ProductCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(ProductSerializer(serializer.instance,
                                              context={'request': request}).data,
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        product = get_object_or_404(Product, slug=slug, is_active=True)
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)

    def put(self, request, slug):
        if not request.user.is_authenticated or not request.user.is_admin:
            return Response({'error': 'Admin only.'}, status=status.HTTP_403_FORBIDDEN)
        product = get_object_or_404(Product, slug=slug)
        serializer = ProductCreateSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(ProductSerializer(product, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug):
        if not request.user.is_authenticated or not request.user.is_admin:
            return Response({'error': 'Admin only.'}, status=status.HTTP_403_FORBIDDEN)
        product = get_object_or_404(Product, slug=slug)
        product.is_active = False
        product.save()
        return Response({'message': 'Product deactivated.'})
