from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.schemas.role import RoleCreate, RoleUpdate, RoleResponse
from app.crud.role import role
from app.utils.permissions import check_permission

router = APIRouter()

@router.post("/", response_model=RoleResponse)
def create_new_role(
    role_in: RoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    organization_id: int = Path(...)
):
    """Create a new role with specified permissions."""
    check_permission(current_user, organization_id, "manage_roles")
    return role.create(db=db, obj_in=role_in, organization_id=organization_id)

@router.get("/{role_id}", response_model=RoleResponse)
def read_role(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    role_id: int = Path(...),
    organization_id: int = Path(...)
):
    """Get a specific role by ID."""
    check_permission(current_user, organization_id, "view_roles")
    
    db_role = role.get(db=db, id=role_id)
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
    if db_role.organization_id != organization_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return db_role

@router.get("/", response_model=List[RoleResponse])
def read_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    organization_id: int = Path(...),
    skip: int = 0,
    limit: int = 100
):
    """Get all roles for the specified organization."""
    check_permission(current_user, organization_id, "view_roles")
    
    # Get roles for the specified organization
    roles = role.get_multi_by_organization(
        db=db,
        organization_id=organization_id,
        skip=skip,
        limit=limit
    )
    return roles

@router.put("/{role_id}", response_model=RoleResponse)
def update_existing_role(
    role_update: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    role_id: int = Path(...),
    organization_id: int = Path(...)
):
    """Update a role's details."""
    check_permission(current_user, organization_id, "manage_roles")
    
    db_role = role.get(db=db, id=role_id)
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
    if db_role.organization_id != organization_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return role.update(db=db, db_obj=db_role, obj_in=role_update)

@router.delete("/{role_id}")
def delete_existing_role(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    role_id: int = Path(...),
    organization_id: int = Path(...)
):
    """Delete a role."""
    check_permission(current_user, organization_id, "manage_roles")
    
    db_role = role.get(db=db, id=role_id)
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
    if db_role.organization_id != organization_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    role.remove(db=db, id=role_id)
    return {"message": "Role deleted successfully"}
