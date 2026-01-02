"""
Authentication & User Serializers
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
import logging

logger = logging.getLogger(__name__)


# ============================================================================
# JWT TOKEN SERIALIZERS
# ============================================================================

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT token serializer with additional user data
    """
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add custom user data
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'is_staff': self.user.is_staff,
            'is_superuser': self.user.is_superuser,
            'date_joined': self.user.date_joined.isoformat(),
        }
        
        # Log successful login
        logger.info(
            f"User logged in: {self.user.username} "
            f"from {self.context['request'].META.get('REMOTE_ADDR')}"
        )
        
        return data
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims to token
        token['username'] = user.username
        token['email'] = user.email
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        token['full_name'] = f"{user.first_name} {user.last_name}".strip()
        
        return token


# ============================================================================
# USER SERIALIZERS
# ============================================================================

class UserSerializer(serializers.ModelSerializer):
    """
    Basic user serializer
    """
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'is_staff', 'is_superuser', 'is_active',
            'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class UserDetailSerializer(serializers.ModelSerializer):
    """
    Detailed user serializer with additional info
    """
    full_name = serializers.SerializerMethodField()
    host_count = serializers.SerializerMethodField()
    workspace_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'is_staff', 'is_superuser', 'is_active',
            'date_joined', 'last_login',
            'host_count', 'workspace_count'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username
    
    def get_host_count(self, obj):
        return obj.owned_hosts.filter(is_deleted=False).count()
    
    def get_workspace_count(self, obj):
        # Will be implemented when workspaces app is created
        return 0


# ============================================================================
# REGISTRATION SERIALIZERS
# ============================================================================

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    User registration serializer with validation
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=8
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=8
    )
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False}
        }
    
    def validate_username(self, value):
        """Validate username is unique and valid"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters")
        
        return value.lower()
    
    def validate_email(self, value):
        """Validate email is unique"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        
        return value.lower()
    
    def validate_password(self, value):
        """Validate password strength"""
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        
        return value
    
    def validate(self, data):
        """Validate passwords match"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match'
            })
        
        return data
    
    def create(self, validated_data):
        """Create new user"""
        validated_data.pop('password_confirm')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        logger.info(f"New user registered: {user.username} ({user.email})")
        
        return user


# ============================================================================
# PASSWORD SERIALIZERS
# ============================================================================

class PasswordChangeSerializer(serializers.Serializer):
    """
    Password change serializer for authenticated users
    """
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        min_length=8,
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        min_length=8,
        style={'input_type': 'password'}
    )
    
    def validate_new_password(self, value):
        """Validate new password strength"""
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        
        return value
    
    def validate(self, data):
        """Validate passwords match"""
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Passwords do not match'
            })
        
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Password reset request serializer
    """
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Validate email exists"""
        if not User.objects.filter(email=value).exists():
            # Don't reveal if email exists for security
            pass
        
        return value.lower()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Password reset confirmation serializer
    """
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        min_length=8,
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        min_length=8,
        style={'input_type': 'password'}
    )
    
    def validate_new_password(self, value):
        """Validate password strength"""
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        
        return value
    
    def validate(self, data):
        """Validate passwords match"""
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Passwords do not match'
            })
        
        return data


# ============================================================================
# PROFILE SERIALIZERS
# ============================================================================

class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    User profile update serializer
    """
    
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name']
    
    def validate_email(self, value):
        """Validate email is unique (excluding current user)"""
        user = self.instance
        if User.objects.filter(email=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("Email already in use")
        
        return value.lower()


# ============================================================================
# API KEY SERIALIZERS
# ============================================================================

class APIKeyValidationSerializer(serializers.Serializer):
    """
    API key validation serializer
    """
    api_key = serializers.CharField(required=True, min_length=32, max_length=64)


# ============================================================================
# SESSION SERIALIZERS
# ============================================================================

class SessionInfoSerializer(serializers.Serializer):
    """
    Session information serializer
    """
    user = UserSerializer(read_only=True)
    ip_address = serializers.CharField(read_only=True)
    user_agent = serializers.CharField(read_only=True)
    authenticated = serializers.BooleanField(read_only=True)
    auth_method = serializers.CharField(read_only=True)
    session_created = serializers.DateTimeField(read_only=True)
