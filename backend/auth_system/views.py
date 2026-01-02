"""
Authentication Views & Endpoints
"""
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.cache import cache
import logging

from .serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    UserDetailSerializer,
    UserRegistrationSerializer,
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    ProfileUpdateSerializer,
    APIKeyValidationSerializer,
    SessionInfoSerializer
)
from .throttling import BurstRateThrottle, SustainedRateThrottle

logger = logging.getLogger(__name__)


# ============================================================================
# AUTHENTICATION VIEWS
# ============================================================================

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT token obtain view with enhanced logging
    """
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [BurstRateThrottle]


class UserRegistrationView(APIView):
    """
    Register new user
    POST /api/auth/register/
    """
    permission_classes = [AllowAny]
    throttle_classes = [BurstRateThrottle]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'User registered successfully',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    Logout user by blacklisting refresh token
    POST /api/auth/logout/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            logger.info(f"User logged out: {request.user.username}")
            
            return Response({
                'message': 'Successfully logged out'
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return Response(
                {'error': 'Invalid token'},
                status=status.HTTP_400_BAD_REQUEST
            )


# ============================================================================
# PASSWORD MANAGEMENT VIEWS
# ============================================================================

class PasswordChangeView(APIView):
    """
    Change user password
    POST /api/auth/change-password/
    """
    permission_classes = [IsAuthenticated]
    throttle_classes = [BurstRateThrottle]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            
            # Verify old password
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'error': 'Invalid old password'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            logger.info(f"Password changed for user: {user.username}")
            
            return Response({
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    """
    Request password reset
    POST /api/auth/password-reset/
    """
    permission_classes = [AllowAny]
    throttle_classes = [BurstRateThrottle]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = User.objects.get(email=email)
                
                # TODO: Generate reset token and send email
                # For now, just log the request
                logger.info(f"Password reset requested for: {email}")
                
                # Always return success to prevent email enumeration
                return Response({
                    'message': 'If the email exists, a reset link has been sent'
                }, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                # Don't reveal that user doesn't exist
                logger.warning(f"Password reset requested for non-existent email: {email}")
                return Response({
                    'message': 'If the email exists, a reset link has been sent'
                }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# PROFILE VIEWS
# ============================================================================

class UserProfileView(APIView):
    """
    Get or update user profile
    GET/PUT/PATCH /api/auth/profile/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get current user profile"""
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        """Update user profile (full)"""
        serializer = ProfileUpdateSerializer(request.user, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Profile updated for user: {request.user.username}")
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request):
        """Update user profile (partial)"""
        serializer = ProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Profile updated for user: {request.user.username}")
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# SESSION VIEWS
# ============================================================================

class SessionInfoView(APIView):
    """
    Get current session information
    GET /api/auth/session/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get session info"""
        auth_method = 'JWT'
        
        if 'HTTP_X_API_KEY' in request.META:
            auth_method = 'API Key'
        elif request.session.session_key:
            auth_method = 'Session'
        
        data = {
            'user': request.user,
            'ip_address': request.META.get('REMOTE_ADDR'),
            'user_agent': request.META.get('HTTP_USER_AGENT', 'Unknown'),
            'authenticated': True,
            'auth_method': auth_method,
            'session_created': timezone.now(),
        }
        
        serializer = SessionInfoSerializer(data)
        return Response(serializer.data)


# ============================================================================
# API KEY VALIDATION VIEWS
# ============================================================================

class ValidateAPIKeyView(APIView):
    """
    Validate API key
    POST /api/auth/validate-api-key/
    """
    permission_classes = [AllowAny]
    throttle_classes = [BurstRateThrottle]
    
    def post(self, request):
        serializer = APIKeyValidationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        api_key = serializer.validated_data['api_key']
        
        from processes.models import Host
        
        try:
            host = Host.objects.get(
                api_key=api_key,
                is_deleted=False,
                monitoring_enabled=True
            )
            
            # Update last_seen
            host.last_seen = timezone.now()
            host.status = 'online'
            host.save(update_fields=['last_seen', 'status'])
            
            logger.info(f"API key validated for host: {host.hostname}")
            
            return Response({
                'valid': True,
                'host': {
                    'id': str(host.id),
                    'hostname': host.hostname,
                    'display_name': host.display_name,
                    'status': host.status,
                    'monitoring_enabled': host.monitoring_enabled
                }
            }, status=status.HTTP_200_OK)
        
        except Host.DoesNotExist:
            logger.warning(f"Invalid API key validation attempt: {api_key[:8]}...")
            return Response(
                {'valid': False, 'error': 'Invalid API key'},
                status=status.HTTP_401_UNAUTHORIZED
            )


# ============================================================================
# USER MANAGEMENT VIEWS (Admin)
# ============================================================================

class UserListView(generics.ListAPIView):
    """
    List all users (admin only)
    GET /api/auth/users/
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter users based on permissions"""
        if self.request.user.is_superuser:
            return self.queryset
        
        # Regular users can only see themselves
        return User.objects.filter(id=self.request.user.id)


class UserDetailView(generics.RetrieveAPIView):
    """
    Get user details
    GET /api/auth/users/{id}/
    """
    queryset = User.objects.all()
    serializer_class = UserDetailSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        """Only allow users to see their own details or admin"""
        obj = super().get_object()
        
        if not self.request.user.is_superuser and obj != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You don't have permission to view this user")
        
        return obj
