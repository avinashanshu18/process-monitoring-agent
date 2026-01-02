"""
URL Configuration for Auth System
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomTokenObtainPairView,
    UserRegistrationView,
    LogoutView,
    PasswordChangeView,
    PasswordResetRequestView,
    UserProfileView,
    SessionInfoView,
    ValidateAPIKeyView,
    UserListView,
    UserDetailView,
)

app_name = 'auth_system'

urlpatterns = [
    # Authentication
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Password Management
    path('change-password/', PasswordChangeView.as_view(), name='change_password'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    
    # Profile
    path('profile/', UserProfileView.as_view(), name='profile'),
    
    # Session
    path('session/', SessionInfoView.as_view(), name='session'),
    
    # API Key
    path('validate-api-key/', ValidateAPIKeyView.as_view(), name='validate_api_key'),
    
    # User Management
    path('users/', UserListView.as_view(), name='user_list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user_detail'),
]
