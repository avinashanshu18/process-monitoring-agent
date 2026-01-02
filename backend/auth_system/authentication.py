"""
Custom Authentication Backends
"""
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


class APIKeyAuthentication(BaseAuthentication):
    """
    Custom API Key authentication backend
    For monitoring agents
    """
    
    def authenticate(self, request):
        api_key = request.META.get('HTTP_X_API_KEY') or request.GET.get('api_key')
        
        if not api_key:
            return None
        
        from processes.models import Host
        
        try:
            host = Host.objects.get(
                api_key=api_key,
                is_deleted=False,
                monitoring_enabled=True
            )
            
            # Store host in request
            request.host = host
            
            # Update last_seen
            host.last_seen = timezone.now()
            host.status = 'online'
            host.save(update_fields=['last_seen', 'status'])
            
            logger.info(f"API Key authentication successful for host: {host.hostname}")
            
            # Return (user, auth) - use None for user since this is host-based
            return (None, host)
            
        except Host.DoesNotExist:
            logger.warning(f"Invalid API key attempted: {api_key[:8]}...")
            raise AuthenticationFailed('Invalid API key')
    
    def authenticate_header(self, request):
        return 'X-API-Key'


class HostTokenAuthentication(BaseAuthentication):
    """
    Token-based authentication for hosts (alternative to API key)
    """
    
    def authenticate(self, request):
        token = request.META.get('HTTP_AUTHORIZATION')
        
        if not token or not token.startswith('HostToken '):
            return None
        
        token = token.split(' ')[1]
        
        from processes.models import Host
        
        try:
            host = Host.objects.get(
                api_key=token,
                is_deleted=False,
                monitoring_enabled=True
            )
            
            request.host = host
            return (None, host)
            
        except Host.DoesNotExist:
            raise AuthenticationFailed('Invalid host token')
    
    def authenticate_header(self, request):
        return 'HostToken'
