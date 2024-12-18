from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from app.core.deps import get_db, get_current_user
from app.core.security import create_invitation_token
from app.models.invitation import Invitation
from app.models.user import User
from app.schemas.invitation import InvitationCreate, InvitationResponse, InvitationUpdate
from app.utils.email import send_invitation_email

router = APIRouter()

@router.post("/{org_id}/invitations", response_model=InvitationResponse)
async def create_invitation(
    org_id: int,
    invitation: InvitationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new invitation and send invitation email"""
    # Check if user has permission to invite
    if not current_user.has_permission(org_id, "invite_members"):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Check if invitation already exists
    existing_invitation = db.query(Invitation).filter(
        Invitation.email == invitation.email,
        Invitation.organization_id == org_id,
        Invitation.is_accepted == False,
        Invitation.expires_at > datetime.utcnow()
    ).first()
    
    if existing_invitation:
        raise HTTPException(
            status_code=400,
            detail="An active invitation already exists for this email"
        )

    # Create invitation
    db_invitation = Invitation(
        email=invitation.email,
        organization_id=org_id,
        invited_by_id=current_user.id,
        role_id=invitation.role_id,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.add(db_invitation)
    db.commit()
    db.refresh(db_invitation)

    # Generate invitation token
    token = create_invitation_token(db_invitation.id)

    # Send invitation email in background
    background_tasks.add_task(
        send_invitation_email,
        invitation.email,
        current_user.full_name,
        org_id,
        token
    )

    return db_invitation

@router.get("/{org_id}/invitations", response_model=List[InvitationResponse])
async def list_invitations(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all invitations for an organization"""
    if not current_user.has_permission(org_id, "view_invitations"):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    invitations = db.query(Invitation).filter(
        Invitation.organization_id == org_id
    ).all()

    return invitations

@router.put("/{org_id}/invitations/{invitation_id}", response_model=InvitationResponse)
async def update_invitation(
    org_id: int,
    invitation_id: int,
    invitation_update: InvitationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update invitation status"""
    if not current_user.has_permission(org_id, "manage_invitations"):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    invitation = db.query(Invitation).filter(
        Invitation.id == invitation_id,
        Invitation.organization_id == org_id
    ).first()

    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    for field, value in invitation_update.dict(exclude_unset=True).items():
        setattr(invitation, field, value)

    db.commit()
    db.refresh(invitation)

    return invitation

@router.delete("/{org_id}/invitations/{invitation_id}")
async def delete_invitation(
    org_id: int,
    invitation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an invitation"""
    if not current_user.has_permission(org_id, "manage_invitations"):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    invitation = db.query(Invitation).filter(
        Invitation.id == invitation_id,
        Invitation.organization_id == org_id
    ).first()

    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    db.delete(invitation)
    db.commit()

    return {"message": "Invitation deleted successfully"}

@router.post("/accept-invitation/{token}")
async def accept_invitation(
    token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Accept an invitation using the invitation token"""
    try:
        invitation_id = verify_invitation_token(token)
    except:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    invitation = db.query(Invitation).filter(
        Invitation.id == invitation_id,
        Invitation.is_accepted == False,
        Invitation.expires_at > datetime.utcnow()
    ).first()

    if not invitation:
        raise HTTPException(status_code=404, detail="Invalid or expired invitation")

    if invitation.email != current_user.email:
        raise HTTPException(status_code=403, detail="This invitation is for a different email")

    # Add user to organization with specified role
    member = OrganizationMember(
        user_id=current_user.id,
        organization_id=invitation.organization_id,
        role_id=invitation.role_id
    )
    db.add(member)

    # Mark invitation as accepted
    invitation.is_accepted = True
    invitation.accepted_at = datetime.utcnow()

    db.commit()

    return {"message": "Invitation accepted successfully"}
