from auth_system.billing import get_effective_plan
from auth_system.plans import get_plan_config

from .models import TeamMembership, TeamWorkspace


def get_team_workspace(user):
    if not user or not user.is_authenticated:
        return None
    if hasattr(user, "owned_team_workspace"):
        workspace = user.owned_team_workspace
        workspace.ensure_owner_membership()
        return workspace
    membership = getattr(user, "team_membership", None)
    if membership:
        return membership.workspace
    return None


def get_team_role(user):
    workspace = get_team_workspace(user)
    if not workspace:
        return None
    if workspace.owner_id == user.id:
        return TeamMembership.Role.OWNER
    membership = getattr(user, "team_membership", None)
    return membership.role if membership and membership.workspace_id == workspace.id else None


def get_workspace_owner(user):
    workspace = get_team_workspace(user)
    return workspace.owner if workspace else user


def get_workspace_plan(user):
    owner = get_workspace_owner(user)
    return get_plan_config(get_effective_plan(owner.account_profile))


def can_manage_workspace(user):
    role = get_team_role(user)
    return role in {TeamMembership.Role.OWNER, TeamMembership.Role.ADMIN}


def can_change_roles(user):
    return get_team_role(user) == TeamMembership.Role.OWNER


def workspace_member_queryset(user):
    workspace = get_team_workspace(user)
    if workspace is None:
        return None
    return workspace.memberships.select_related("user", "workspace").order_by("joined_at", "user__username")


def workspace_member_ids(user):
    workspace = get_team_workspace(user)
    if workspace is None:
        return [user.id]
    return list(workspace.memberships.values_list("user_id", flat=True))


def ensure_team_workspace_for_owner(user):
    workspace, created = TeamWorkspace.objects.get_or_create(
        owner=user,
        defaults={"name": f"{(user.get_full_name() or user.username).strip()} Workspace"},
    )
    if created or not workspace.name:
        workspace.name = workspace.name or f"{user.username} Workspace"
        workspace.save(update_fields=["name", "updated_at"])
    workspace.ensure_owner_membership()
    return workspace
