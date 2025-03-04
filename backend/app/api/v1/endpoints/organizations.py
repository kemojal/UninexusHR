from typing import Any, List
from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.models.user import User
from app.schemas.organization import Organization, OrganizationCreate, OrganizationUpdate
from app.schemas.invitation import InvitationCreate, InvitationResponse
from app.schemas.join_request import JoinRequest, JoinRequestCreate
from app.schemas.role import RoleCreate
from app.utils import send_invitation_email
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[Organization])
def read_organizations(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve organizations.
    If the user is superuser, return all organizations.
    If the user is not superuser, return only organizations they belong to.
    """
    if crud.user.is_superuser(current_user):
        organizations = crud.organization.get_multi(db, skip=skip, limit=limit)
    else:
        organizations = current_user.organizations
    return organizations

@router.post("/", response_model=Organization)
def create_organization(
    *,
    db: Session = Depends(deps.get_db),
    organization_in: OrganizationCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new organization and set current user as admin.
    """
    # Create the organization
    organization = crud.organization.create(db=db, obj_in=organization_in)
    
    # Create admin role with all permissions
    admin_role = crud.role.create(
        db=db,
        obj_in=RoleCreate(
            name="Admin",
            description="Organization administrator with full access",
            permissions=[
                "manage_roles",
                "view_roles",
                "manage_members",
                "view_members",
                "manage_organization",
                "view_organization",
                "manage_permissions",
                "view_permissions"
            ]
        ),
        organization_id=organization.id
    )
    
    # Add the current user as an admin of the organization
    crud.organization.add_user_with_role(
        db=db,
        org_id=organization.id,
        user_id=current_user.id,
        role_id=admin_role.id
    )
    
    return organization

@router.get("/{organization_id}", response_model=Organization)
def read_organization(
    *,
    db: Session = Depends(deps.get_db),
    organization_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get organization by ID.
    """
    organization = crud.organization.get(db=db, id=organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    if not crud.user.is_superuser(current_user) and organization not in current_user.organizations:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return organization

@router.put("/{organization_id}", response_model=Organization)
def update_organization(
    *,
    db: Session = Depends(deps.get_db),
    organization_id: int,
    organization_in: OrganizationUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update an organization.
    """
    organization = crud.organization.get(db=db, id=organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    if not crud.organization.is_admin(db, org_id=organization_id, user_id=current_user.id):
        raise HTTPException(status_code=403, detail="Only organization admins can update")
    organization = crud.organization.update(
        db=db, db_obj=organization, obj_in=organization_in
    )
    return organization

@router.post("/{organization_id}/invitations", response_model=InvitationResponse)
async def create_invitation(
    *,
    db: Session = Depends(deps.get_db),
    organization_id: int,
    invitation_in: InvitationCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create an invitation to join an organization.
    """
    organization = crud.organization.get(db=db, id=organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Check if current user is admin of the organization
    if not crud.organization.is_admin(db, org_id=organization_id, user_id=current_user.id):
        raise HTTPException(status_code=403, detail="Only organization admins can send invites")
    
    # Check if role exists
    role = crud.role.get(db=db, id=invitation_in.role_id)
    if not role or role.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Role not found in this organization")
    
    # Create invitation
    invitation = crud.invitation.create(
        db=db,
        obj_in=invitation_in,
        organization_id=organization_id,
        invited_by_id=current_user.id
    )
    
    # Send invitation email
    try:
        await send_invitation_email(
            email=invitation_in.email,
            inviter_name=current_user.full_name,
            organization_name=organization.name,
            token=invitation.token
        )
    except Exception as e:
        # Log the error but don't fail the request
        print(f"Failed to send invitation email: {e}")
    
    return invitation

@router.get("/{organization_id}/invitations", response_model=List[InvitationResponse])
def read_invitations(
    *,
    db: Session = Depends(deps.get_db),
    organization_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all invitations for an organization.
    """
    organization = crud.organization.get(db=db, id=organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    if not crud.organization.is_admin(db, org_id=organization_id, user_id=current_user.id):
        raise HTTPException(status_code=403, detail="Only organization admins can view invites")
    
    return crud.invitation.get_by_organization(db=db, organization_id=organization_id)

@router.delete("/{organization_id}/invitations/{invitation_id}", response_model=Any)
def cancel_invitation(
    *,
    db: Session = Depends(deps.get_db),
    organization_id: int,
    invitation_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Cancel an invitation.
    """
    organization = crud.organization.get(db=db, id=organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    if not crud.organization.is_admin(db, org_id=organization_id, user_id=current_user.id):
        raise HTTPException(status_code=403, detail="Only organization admins can cancel invites")
    
    invitation = crud.invitation.get(db=db, id=invitation_id)
    if not invitation or invitation.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Invitation not found")
    
    crud.invitation.remove(db=db, id=invitation_id)
    return {"status": "success", "message": "Invitation cancelled"}

@router.post("/{organization_id}/invitations/{invitation_id}/resend", response_model=Any)
async def resend_invitation(
    *,
    db: Session = Depends(deps.get_db),
    organization_id: int,
    invitation_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Resend an invitation email.
    """
    organization = crud.organization.get(db=db, id=organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    if not crud.organization.is_admin(db, org_id=organization_id, user_id=current_user.id):
        raise HTTPException(status_code=403, detail="Only organization admins can resend invites")
    
    invitation = crud.invitation.get(db=db, id=invitation_id)
    if not invitation or invitation.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Invitation not found")
    
    # Refresh invitation token and expiry
    invitation = crud.invitation.refresh(db=db, db_obj=invitation)
    
    # Resend invitation email
    try:
        await send_invitation_email(
            email=invitation.email,
            inviter_name=current_user.full_name,
            organization_name=organization.name,
            token=invitation.token
        )
    except Exception as e:
        # Log the error but don't fail the request
        print(f"Failed to send invitation email: {e}")
    
    return {"status": "success", "message": "Invitation resent"}

@router.post("/{organization_id}/invite", response_model=Any)
def invite_to_organization(
    *,
    db: Session = Depends(deps.get_db),
    organization_id: int,
    email: str = Body(...),
    role: str = Body(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Invite a user to join an organization.
    """
    organization = crud.organization.get(db=db, id=organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Check if current user is admin of the organization
    if not crud.organization.is_admin(db, org_id=organization_id, user_id=current_user.id):
        raise HTTPException(status_code=403, detail="Only organization admins can send invites")
    
    # TODO: Implement invitation logic (send email, create invitation record, etc.)
    return {"status": "success", "message": f"Invitation sent to {email}"}
