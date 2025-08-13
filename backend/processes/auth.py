from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions

class HeaderApiKeyAuthentication(BaseAuthentication):
    """
    Looks for 'X-API-Key' header. If it matches settings.PROC_MONITOR_API_KEY,
    we treat as authenticated. Otherwise None (allow unauth endpoints) or raise on restricted.
    """
    def authenticate(self, request):
        # Only used on endpoints that check request.successful_authenticator
        api_key = request.headers.get("X-API-Key")
        expected = getattr(settings, "PROC_MONITOR_API_KEY", None)
        if api_key and expected and api_key == expected:
            # Return an anonymous-like user context; not binding to Django users.
            return (None, None)
        return None
