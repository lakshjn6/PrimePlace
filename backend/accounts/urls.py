from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/',            views.RegisterView.as_view(),           name='register'),
    path('verify-email/',        views.VerifyEmailView.as_view(),        name='verify-email'),
    path('resend-verification/', views.ResendVerificationView.as_view(), name='resend-verification'),
    path('login/',               views.LoginView.as_view(),              name='login'),
    path('logout/',              views.LogoutView.as_view(),             name='logout'),
    path('profile/',             views.ProfileView.as_view(),            name='profile'),
    path('users/',               views.UserListView.as_view(),           name='user-list'),
    path('token/refresh/',       TokenRefreshView.as_view(),             name='token-refresh'),
]