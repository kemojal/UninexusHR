from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.models.permission import Permission
from app.schemas.permission import PermissionCreate, PermissionUpdate, PermissionResponse
from app.crud import permission

router = APIRouter()

# Default permissions that will be created for each organization
DEFAULT_PERMISSIONS = [
    {"name": "view_members", "description": "View organization members", "category": "members"},
    {"name": "invite_members", "description": "Invite new members", "category": "members"},
    {"name": "remove_members", "description": "Remove members from organization", "category": "members"},
    {"name": "manage_roles", "description": "Manage roles and permissions", "category": "roles"},
    {"name": "view_analytics", "description": "View organization analytics", "category": "analytics"},
    {"name": "manage_settings", "description": "Manage organization settings", "category": "settings"},
    {"name": "view_billing", "description": "View billing information", "category": "billing"},
    {"name": "manage_billing", "description": "Manage billing and subscriptions", "category": "billing"},
]

@router.post("/", response_model=PermissionResponse)
def create_new_permission(
    permission_in: PermissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new permission."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions to create permissions"
        )
    return permission.create(db=db, obj_in=permission_in, organization_id=current_user.organization_id)

@router.get("/{permission_id}", response_model=PermissionResponse)
def read_permission(
    permission_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific permission by ID."""
    db_permission = permission.get(db=db, id=permission_id)
    if not db_permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    if db_permission.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return db_permission

@router.get("/", response_model=List[PermissionResponse])
def read_permissions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all permissions for the specified organization."""
    if not current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Check if organization has any permissions
    existing_permissions = permission.get_multi_by_organization(
        db=db,
        organization_id=current_user.organization_id,
        skip=skip,
        limit=limit
    )

    # If no permissions exist, create default permissions
    if not existing_permissions:
        for perm in DEFAULT_PERMISSIONS:
            permission.create(
                db=db,
                obj_in=PermissionCreate(
                    name=perm["name"],
                    description=perm["description"],
                    category=perm["category"]
                ),
                organization_id=current_user.organization_id
            )
        existing_permissions = permission.get_multi_by_organization(
            db=db,
            organization_id=current_user.organization_id,
            skip=skip,
            limit=limit
        )

    return existing_permissions

@router.put("/{permission_id}", response_model=PermissionResponse)
def update_existing_permission(
    *,
    permission_id: int = Path(...),
    permission_update: PermissionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a permission's details."""
    db_permission = permission.get(db=db, id=permission_id)
    if not db_permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    if db_permission.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return permission.update(db=db, db_obj=db_permission, obj_in=permission_update)

@router.delete("/{permission_id}")
def delete_existing_permission(
    permission_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a permission."""
    db_permission = permission.get(db=db, id=permission_id)
    if not db_permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    if db_permission.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    permission.remove(db=db, id=permission_id)
    return {"message": "Permission deleted successfully"}
