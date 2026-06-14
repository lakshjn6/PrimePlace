from rest_framework import serializers
from .models import SiteReview


class SiteReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.first_name', read_only=True)
    created_at = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = SiteReview
        fields = ['id', 'user_name', 'message', 'rating', 'created_at']
        read_only_fields = ['id', 'user_name', 'created_at']
    
    def get_created_at(self, obj):
        return obj.created_at.strftime('%B %d, %Y')


class SiteReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteReview
        fields = ['message', 'rating']
    
    def validate_message(self, value):
        if len(value) < 10:
            raise serializers.ValidationError(
                "Review must be at least 10 characters long."
            )
        return value
    
    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)