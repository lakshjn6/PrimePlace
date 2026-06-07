from rest_framework import serializers
from .models import Account


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model  = Account
        fields = ['first_name', 'last_name', 'username', 'email',
                  'phone_number', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        if Account.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "Username already taken."})
        if Account.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Email already registered."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = Account(**validated_data)
        user.set_password(password)
        user.is_active = False   # inactive until email verified
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email    = data.get('email')
        password = data.get('password')
        try:
            user = Account.objects.get(email=email)
        except Account.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials.")
        if not user.check_password(password):
            raise serializers.ValidationError("Invalid credentials.")
        if not user.is_active:
            raise serializers.ValidationError(
                "Account not verified. Please check your email and verify your account."
            )
        data['user'] = user
        return data


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Account
        fields = ['id', 'first_name', 'last_name', 'username',
                  'email', 'phone_number', 'date_joined',
                  'is_admin', 'is_active']
        read_only_fields = ['id', 'date_joined', 'is_admin', 'is_active']