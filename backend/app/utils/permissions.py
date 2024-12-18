from fastapi import HTTPException
from app.models.user import User

def check_permission(user: User, organization_id: int, permission_name: str):
    """Check if a user has a specific permission in an organization"""
    # First check if user belongs to the organization
    if not any(org.organization_id == organization_id for org in user.user_organizations):
        raise HTTPException(
            status_code=403,
            detail="User does not belong to this organization"
        )
    
    # Check if user has the required permission
    if not user.has_permission(organization_id, permission_name):
        raise HTTPException(
            status_code=403,
            detail=f"User does not have the required permission: {permission_name}"
        )
