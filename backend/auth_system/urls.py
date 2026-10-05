"""
URL Configuration for Auth System
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    BillingCheckoutView,
    BillingPortalView,
    ClaimDeviceView,
    CustomTokenObtainPairView,
    OnboardingKitView,
    UserRegistrationView,
    LogoutView,
    PasswordChangeView,
    PasswordResetRequestView,
    UserProfileView,
    RotateOnboardingKeyView,
    SessionInfoView,
    TeamInviteAcceptView,
    TeamInviteView,
    TeamMembershipDetailView,
    TeamWorkspaceView,
    StripeWebhookView,
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
    path('claim-device/', ClaimDeviceView.as_view(), name='claim_device'),
    path('onboarding-kit/', OnboardingKitView.as_view(), name='onboarding_kit'),
    path('onboarding-kit/rotate/', RotateOnboardingKeyView.as_view(), name='rotate_onboarding_key'),
    path('team-workspace/', TeamWorkspaceView.as_view(), name='team_workspace'),
    path('team-invites/', TeamInviteView.as_view(), name='team_invites'),
    path('team-invites/accept/', TeamInviteAcceptView.as_view(), name='team_invites_accept'),
    path('team-members/<int:membership_id>/', TeamMembershipDetailView.as_view(), name='team_members_detail'),

    # Billing
    path('billing/checkout/', BillingCheckoutView.as_view(), name='billing_checkout'),
    path('billing/portal/', BillingPortalView.as_view(), name='billing_portal'),
    path('billing/webhook/', StripeWebhookView.as_view(), name='billing_webhook'),

    # API Key
    path('validate-api-key/', ValidateAPIKeyView.as_view(), name='validate_api_key'),
    
    # User Management
    path('users/', UserListView.as_view(), name='user_list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user_detail'),
]
