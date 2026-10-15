from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.db.models import Q
import difflib

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


# ── Search View ────────────────────────────────────────────────────────────────
class ProductSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query or len(query) < 2:
            return Response({'results': [], 'corrected_query': None, 'suggestion': None})

        q_lower = query.lower()

        # ── 1. Direct DB search (name, description, category name) ──────────
        direct_qs = Product.objects.filter(is_active=True).filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(category__name__icontains=query)
        ).select_related('category').distinct()[:10]

        results = list(direct_qs)

        # ── 2. Fuzzy / spell-correction if direct hits are thin ─────────────
        corrected_query = None
        suggestion = None

        if len(results) < 3:
            # Build a vocabulary from all active product names + category names
            all_products = Product.objects.filter(is_active=True).select_related('category')
            vocab_map = {}   # normalised_word -> original Product queryset filter
            word_pool = []

            for p in all_products:
                for token in p.name.lower().split():
                    if token not in vocab_map:
                        vocab_map[token] = []
                    vocab_map[token].append(p.id)
                    word_pool.append(token)

                cat_token = p.category.name.lower()
                if cat_token not in vocab_map:
                    vocab_map[cat_token] = []
                vocab_map[cat_token].append(p.id)
                word_pool.append(cat_token)

            unique_words = list(set(word_pool))

            # Find close matches for each word in query
            matched_ids = set()
            corrected_tokens = []

            for token in q_lower.split():
                # Try exact token first
                if token in vocab_map:
                    corrected_tokens.append(token)
                    matched_ids.update(vocab_map[token])
                else:
                    # Fuzzy match — cutoff 0.6 catches 1-2 char typos
                    close = difflib.get_close_matches(token, unique_words, n=3, cutoff=0.6)
                    if close:
                        best = close[0]
                        corrected_tokens.append(best)
                        matched_ids.update(vocab_map.get(best, []))
                    else:
                        corrected_tokens.append(token)

            # Build corrected query string if it differs from original
            corrected = ' '.join(corrected_tokens)
            if corrected.lower() != q_lower and matched_ids:
                corrected_query = corrected
                suggestion = f'Did you mean "{corrected}"?'

            # Fetch fuzzy-matched products not already in results
            existing_ids = {p.id for p in results}
            if matched_ids:
                fuzzy_qs = Product.objects.filter(
                    is_active=True, id__in=matched_ids
                ).exclude(id__in=existing_ids).select_related('category')[:8]
                results = results + list(fuzzy_qs)

        serializer = ProductSerializer(results, many=True, context={'request': request})
        return Response({
            'results': serializer.data,
            'corrected_query': corrected_query,
            'suggestion': suggestion,
            'total': len(results),
        })

