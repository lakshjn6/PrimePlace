from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Account, EmailVerificationToken
from .serializers import RegisterSerializer, LoginSerializer, AccountSerializer
from .email_utils import send_verification_email


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
    }


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token_obj = EmailVerificationToken.objects.create(user=user)
            print(f"DEBUG TOKEN CREATED: {token_obj.token}")
            print(f"DEBUG USER: {user.email}")
            try:
             send_verification_email(user, token_obj.token)
            except Exception as e:
                print(f"Email send failed: {e}")
            return Response({
                'message': (
                    'Registration successful! '
                    'Please check your email and click the verification link.'
                ),
                'email': user.email,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        token = request.query_params.get('token')
        if not token:
            return Response({'error': 'Token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token_obj = EmailVerificationToken.objects.select_related('user').get(token=token)
        except EmailVerificationToken.DoesNotExist:
            return Response({'error': 'Invalid or already used token.'}, status=status.HTTP_400_BAD_REQUEST)
        if token_obj.is_expired():
            token_obj.delete()
            return Response({'error': 'Token expired. Please register again.'}, status=status.HTTP_400_BAD_REQUEST)
        user = token_obj.user
        user.is_active = True
        user.save()
        token_obj.delete()
        tokens = get_tokens_for_user(user)
        return Response({
            'message': 'Email verified! Your account is now active.',
            'user':    AccountSerializer(user).data,
            'tokens':  tokens,
        }, status=status.HTTP_200_OK)


class ResendVerificationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = Account.objects.get(email=email)
        except Account.DoesNotExist:
            return Response({'error': 'No account with that email.'}, status=status.HTTP_404_NOT_FOUND)
        if user.is_active:
            return Response({'message': 'Account already verified. Please login.'})
        EmailVerificationToken.objects.filter(user=user).delete()
        token_obj = EmailVerificationToken.objects.create(user=user)
        try:
            send_verification_email(user, token_obj.token)
        except Exception as e:
            return Response({'error': f'Failed to send email: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({'message': 'Verification email resent. Please check your inbox.'})


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user   = serializer.validated_data['user']
            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'Login successful.',
                'user':    AccountSerializer(user).data,
                'tokens':  tokens,
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'})
        except Exception:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(AccountSerializer(request.user).data)

    def put(self, request):
        serializer = AccountSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not request.user.is_admin:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        users = Account.objects.all().order_by('-date_joined')
        return Response(AccountSerializer(users, many=True).data)