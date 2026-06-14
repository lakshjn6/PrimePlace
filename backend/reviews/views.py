from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import SiteReview
from .serializers import SiteReviewSerializer, SiteReviewCreateSerializer


class SiteReviewViewSet(viewsets.ModelViewSet):
    """Site-wide reviews API"""
    
    queryset = SiteReview.objects.filter(is_active=True).select_related('user')
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return SiteReview.objects.filter(
            is_active=True
        ).select_related('user').order_by('-created_at')[:5]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SiteReviewCreateSerializer
        return SiteReviewSerializer
    
    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        review = serializer.instance
        display_serializer = SiteReviewSerializer(review)
        return Response(display_serializer.data, status=status.HTTP_201_CREATED)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        reviews = self.get_queryset()
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)
