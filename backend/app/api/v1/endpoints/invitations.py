from datetime import datetime, timedelta
from typing import List
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app import schemas, models, crud
from app.api import deps
from app.core.config import settings
from app.utils.email import send_invitation_email

router = APIRouter()

@router.post("/{organization_id}/invitations", response_model=schemas.InvitationResponse)
async def create_invitation(
    organization_id: int,
    invitation: schemas.InvitationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    # Check if user has permission to invite members
    if not crud.organization.is_user_admin(db, organization_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Check if user is already a member
    if crud.member.get_by_email(db, organization_id=organization_id, email=invitation.email):
        raise HTTPException(status_code=400, detail="User is already a member")

    # Check if there's a pending invitation
    existing_invitation = crud.invitation.get_pending_by_email(
        db, organization_id=organization_id, email=invitation.email
    )
    if existing_invitation:
        raise HTTPException(status_code=400, detail="Invitation already sent")

    # Create invitation
    token = str(uuid4())
    expires_at = datetime.utcnow() + timedelta(days=7)
    
    db_invitation = models.Invitation(
        email=invitation.email,
        organization_id=organization_id,
        invited_by_id=current_user.id,
        role_id=invitation.role_id,
        token=token,
        expires_at=expires_at,
        status="pending"
    )
    db.add(db_invitation)
    db.commit()
    db.refresh(db_invitation)

    # Send invitation email
    invitation_url = f"{settings.FRONTEND_URL}/join?token={token}"
    background_tasks.add_task(
        send_invitation_email,
        email_to=invitation.email,
        invitation_url=invitation_url,
        organization_name=db_invitation.organization.name
    )

    return db_invitation

@router.get("/{organization_id}/invitations", response_model=List[schemas.InvitationResponse])
def list_invitations(
    organization_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    # Debug information
    print(f"Checking permissions for user {current_user.id} in organization {organization_id}")
    print(f"User roles: {[role.name for role in current_user.roles]}")
    
    # Check if user has permission to view invitations
    is_admin = crud.organization.is_admin(db, org_id=organization_id, user_id=current_user.id)
    print(f"Is admin check result: {is_admin}")
    
    if not is_admin:
        raise HTTPException(status_code=403, detail="Only organization admins can view invites")

    return crud.invitation.get_multi_by_org(db, organization_id=organization_id)

@router.delete("/{organization_id}/invitations/{invitation_id}")
def delete_invitation(
    organization_id: int,
    invitation_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    # Check if user has permission to delete invitations
    if not crud.organization.is_user_admin(db, organization_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    invitation = crud.invitation.get(db, id=invitation_id)
    if not invitation or invitation.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Invitation not found")

    crud.invitation.remove(db, id=invitation_id)
    return {"message": "Invitation deleted successfully"}

@router.post("/accept-invitation/{token}")
async def accept_invitation(
    token: str,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Accept an invitation using the invitation token"""
    invitation = crud.invitation.get_by_token(db, token=token)
    if not invitation or invitation.status != "pending" or invitation.expires_at < datetime.utcnow():
        raise HTTPException(status_code=404, detail="Invalid or expired invitation")

    if invitation.email != current_user.email:
        raise HTTPException(status_code=403, detail="This invitation is for a different email address")

    # Add user to organization with specified role
    crud.member.create(
        db,
        organization_id=invitation.organization_id,
        user_id=current_user.id,
        role_id=invitation.role_id
    )

    # Mark invitation as accepted
    invitation.status = "accepted"
    db.commit()

    return {"message": "Invitation accepted successfully"}
