from rest_framework import permissions


class IsHostOwnerOrReadOnly(permissions.BasePermission):
    """
    Minimal MVP permission:
    allow reads for authenticated users and restrict writes to the owner.
    Superusers are allowed full access.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        user = request.user
        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        owner_id = getattr(obj, "owner_id", None)
        return owner_id == user.id


class HasAPIKey(permissions.BasePermission):
    """
    Temporary marker permission for agent-authenticated endpoints.
    The active MVP path authenticates via X-API-Key in the request header.
    """

    def has_permission(self, request, view):
        return bool(request.headers.get("X-API-Key"))
