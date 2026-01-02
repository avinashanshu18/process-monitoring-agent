"""
Custom Throttling Classes
Rate limiting for different user types and endpoints
"""
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle


class BurstRateThrottle(UserRateThrottle):
    """
    High rate limit for burst requests
    """
    scope = 'burst'
    rate = '60/min'


class SustainedRateThrottle(UserRateThrottle):
    """
    Lower rate limit for sustained requests
    """
    scope = 'sustained'
    rate = '1000/hour'


class AgentRateThrottle(UserRateThrottle):
    """
    Rate limit for monitoring agents
    Agents can send more frequent updates
    """
    scope = 'agent'
    rate = '120/min'


class SnapshotUploadThrottle(UserRateThrottle):
    """
    Rate limit for snapshot uploads
    """
    scope = 'snapshot_upload'
    rate = '60/min'


class APIKeyThrottle(UserRateThrottle):
    """
    Rate limit for API key based requests
    """
    scope = 'api_key'
    rate = '1000/hour'
    
    def get_cache_key(self, request, view):
        # Use API key instead of user for cache key
        api_key = request.META.get('HTTP_X_API_KEY')
        
        if api_key:
            return f'throttle_api_key_{api_key}'
        
        return super().get_cache_key(request, view)
