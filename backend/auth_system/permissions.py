"""
Production-Grade Permissions
Role-based access control, API key authentication, and custom permissions
"""
from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


# ============================================================================
# CUSTOM PERMISSIONS
# ============================================================================

class IsHostOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of a host to edit it.
    Workspace members can view but not edit.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for workspace members
        if request.method in permissions.SAFE_METHODS:
            # Check if user is owner or workspace member
            if hasattr(obj, 'owner'):
                if obj.owner == request.user:
                    return True
            
            if hasattr(obj, 'workspace') and obj.workspace:
                return obj.workspace.members.filter(id=request.user.id).exists()
            
            return False
        
        # Write permissions only for owner
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        
        return False


class IsWorkspaceMember(permissions.BasePermission):
    """
    Permission to check if user is a workspace member
    """
    
    def has_object_permission(self, request, view, obj):
        if not hasattr(obj, 'workspace') or not obj.workspace:
            return False
        
        return obj.workspace.members.filter(id=request.user.id).exists()


class IsWorkspaceAdmin(permissions.BasePermission):
    """
    Permission to check if user is a workspace admin
    """
    
    def has_object_permission(self, request, view, obj):
        if not hasattr(obj, 'workspace') or not obj.workspace:
            return False
        
        return obj.workspace.admins.filter(id=request.user.id).exists()


class HasAPIKey(permissions.BasePermission):
    """
    Permission to check for valid API key
    Used for agent authentication
    """
    
    def has_permission(self, request, view):
        api_key = request.META.get('HTTP_X_API_KEY') or request.GET.get('api_key')
        
        if not api_key:
            logger.warning(f"API request without API key from {request.META.get('REMOTE_ADDR')}")
            return False
        
        # Validate API key
        from processes.models import Host
        
        try:
            host = Host.objects.get(api_key=api_key, is_deleted=False)
            
            # Store host in request for later use
            request.host = host
            
            # Update last_seen
            host.last_seen = timezone.now()
            host.status = 'online'
            host.save(update_fields=['last_seen', 'status'])
            
            logger.info(f"Valid API key used by host: {host.hostname}")
            return True
            
        except Host.DoesNotExist:
            logger.warning(f"Invalid API key attempted: {api_key[:8]}...")
            return False
    
    def has_object_permission(self, request, view, obj):
        # API key must match the object's host
        if hasattr(request, 'host') and hasattr(obj, 'host'):
            return request.host == obj.host
        
        if hasattr(request, 'host'):
            from processes.models import Host
            if isinstance(obj, Host):
                return request.host == obj
        
        return False


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission to check if user is owner or admin
    """
    
    def has_object_permission(self, request, view, obj):
        # Superusers can do anything
        if request.user.is_superuser:
            return True
        
        # Check if user is owner
        if hasattr(obj, 'owner') and obj.owner == request.user:
            return True
        
        # Check if user is staff
        if request.user.is_staff:
            return True
        
        return False


class ReadOnly(permissions.BasePermission):
    """
    Read-only permission
    """
    
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS


class IsSuperUser(permissions.BasePermission):
    """
    Permission to check if user is a superuser
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser


class IsOwner(permissions.BasePermission):
    """
    Permission to check if user owns the object
    """
    
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


class IsTeamMember(permissions.BasePermission):
    """
    Permission to check if user is part of the team
    """
    
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'team'):
            return obj.team.members.filter(id=request.user.id).exists()
        
        return False


# ============================================================================
# ROLE CHECKS (Helper Functions)
# ============================================================================

def is_workspace_admin(user, workspace):
    """
    Check if user is workspace admin
    """
    if user.is_superuser:
        return True
    
    if not workspace:
        return False
    
    return workspace.admins.filter(id=user.id).exists()


def is_workspace_member(user, workspace):
    """
    Check if user is workspace member
    """
    if user.is_superuser:
        return True
    
    if not workspace:
        return False
    
    return workspace.members.filter(id=user.id).exists()


def can_view_host(user, host):
    """
    Check if user can view host
    """
    if user.is_superuser:
        return True
    
    # Owner can view
    if host.owner == user:
        return True
    
    # Workspace members can view
    if host.workspace and is_workspace_member(user, host.workspace):
        return True
    
    return False


def can_edit_host(user, host):
    """
    Check if user can edit host
    """
    if user.is_superuser:
        return True
    
    # Only owner can edit
    if host.owner == user:
        return True
    
    return False


def can_delete_host(user, host):
    """
    Check if user can delete host
    """
    if user.is_superuser:
        return True
    
    # Only owner can delete
    if host.owner == user:
        return True
    
    return False


def has_permission(user, permission_name, obj=None):
    """
    Generic permission checker
    """
    if user.is_superuser:
        return True
    
    # Check Django permissions
    if user.has_perm(permission_name):
        return True
    
    # Object-level permission check
    if obj:
        if hasattr(obj, 'owner') and obj.owner == user:
            return True
    
    return False
