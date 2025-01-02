from datetime import datetime, timedelta
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Query, Body, BackgroundTasks
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.models import User, Organization, Role, UserOrganization, Invitation, user_roles
from app.schemas.member import MemberCreate, MemberUpdate, MemberResponse
from app.schemas.invitation import InvitationCreate
from app.core.security import get_password_hash
from app.utils.permissions import check_permission
from app.utils.email import send_invitation_email
from app.crud import crud_invitation, crud_member, crud_organization
from app.core.config import settings
import secrets
import string

router = APIRouter()

def generate_temp_password(length=12):
    """Generate a secure temporary password"""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(alphabet) for _ in range(length))

@router.get("/", response_model=List[MemberResponse])
async def list_members(
    organization_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: Optional[str] = "created_at",
    order: Optional[str] = "desc"
):
    """List all members in an organization with advanced filtering"""
    check_permission(current_user, organization_id, "view_members")
    
    # Query users with their organization memberships
    query = (
        db.query(User, UserOrganization)
        .join(UserOrganization)
        .filter(UserOrganization.organization_id == organization_id)
    )
    
    if search:
        query = query.filter(
            (User.full_name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%"))
        )
    
    if role:
        query = (
            query
            .join(user_roles, user_roles.c.user_id == User.id)
            .join(Role, user_roles.c.role_id == Role.id)
            .filter(Role.name == role)
        )
        
    if status:
        query = query.filter(User.status == status)
        
    if order == "desc":
        query = query.order_by(getattr(User, sort_by).desc())
    else:
        query = query.order_by(getattr(User, sort_by).asc())
        
    results = query.all()
    
    # Transform the results into the response format
    members = []
    for user, user_org in results:
        # Get the roles for this user in this organization using user_roles table
        roles = (
            db.query(Role)
            .join(user_roles)  # Join with user_roles table directly
            .filter(
                user_roles.c.user_id == user.id,
                user_roles.c.organization_id == organization_id
            )
            .all()
        )
        
        # Create member response with organization_id
        member_dict = user.__dict__
        member_dict["organization_id"] = organization_id
        member_dict["roles"] = [{"id": role.id, "name": role.name} for role in roles]
        members.append(member_dict)
    
    return [MemberResponse.from_orm(member) for member in members]

@router.post("/invite")
async def invite_member(
    organization_id: int,
    invitation: InvitationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Invite a new member to the organization"""
    check_permission(current_user, organization_id, "invite_members")
    
    # Check if user is already a member
    if crud_member.get_by_email(db, organization_id=organization_id, email=invitation.email):
        raise HTTPException(status_code=400, detail="User is already a member")

    # Check if there's a pending invitation
    existing_invitation = crud_invitation.get_pending_by_email(
        db, organization_id=organization_id, email=invitation.email
    )
    if existing_invitation:
        raise HTTPException(status_code=400, detail="Invitation already sent")

    # Create invitation
    token = str(uuid4())
    expires_at = datetime.utcnow() + timedelta(days=7)
    
    db_invitation = Invitation(
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

    # Get organization name for the email
    organization = crud_organization.get(db, id=organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")

    # Send invitation email
    invitation_url = f"{settings.FRONTEND_URL}/join?token={token}"
    background_tasks.add_task(
        send_invitation_email,
        email_to=invitation.email,
        invitation_url=invitation_url,
        organization_name=organization.name
    )

    return {"message": "Invitation sent successfully", "invitation": db_invitation}

@router.post("/bulk")
async def bulk_action(
    organization_id: int,
    member_ids: List[int] = Body(...),
    action: str = Body(...),
    data: dict = Body(default={}),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Perform bulk actions on members"""
    check_permission(current_user, organization_id, "manage_members")
    
    members = db.query(User).join(UserOrganization).filter(
        UserOrganization.organization_id == organization_id,
        User.id.in_(member_ids)
    ).all()
    
    if action == "delete":
        for member in members:
            db.query(UserOrganization).filter(
                UserOrganization.user_id == member.id,
                UserOrganization.organization_id == organization_id
            ).delete()
    elif action == "update_roles":
        role_ids = data.get("role_ids", [])
        roles = db.query(Role).filter(
            Role.id.in_(role_ids),
            Role.organization_id == organization_id
        ).all()
        for member in members:
            member_org = db.query(UserOrganization).filter(
                UserOrganization.user_id == member.id,
                UserOrganization.organization_id == organization_id
            ).first()
            if member_org:
                member_org.role_id = roles[0].id if roles else None
    
    db.commit()
    return {"message": f"Bulk {action} completed successfully"}

@router.put("/{member_id}/roles")
async def update_member_roles(
    organization_id: int,
    member_id: int,
    role_ids: List[int] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update member roles"""
    check_permission(current_user, organization_id, "manage_members")
    
    # Check if member exists in organization
    member_org = db.query(UserOrganization).filter(
        UserOrganization.user_id == member_id,
        UserOrganization.organization_id == organization_id
    ).first()
    
    if not member_org:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Verify all roles exist and belong to this organization
    roles = db.query(Role).filter(
        Role.id.in_(role_ids),
        Role.organization_id == organization_id
    ).all()
    
    if not roles:
        raise HTTPException(status_code=404, detail="No valid roles found")
    
    # Delete existing role assignments for this user in this organization
    db.query(user_roles).filter(
        user_roles.c.user_id == member_id,
        user_roles.c.organization_id == organization_id
    ).delete(synchronize_session=False)
    
    # Add new role assignments
    for role_id in role_ids:
        db.execute(
            user_roles.insert().values(
                user_id=member_id,
                role_id=role_id,
                organization_id=organization_id
            )
        )
    
    db.commit()
    return {"message": "Member roles updated successfully"}

@router.get("/members/{member_id}/activity")
async def get_member_activity(
    organization_id: int,
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 10,
    offset: int = 0
):
    """Get member activity history"""
    check_permission(current_user, organization_id, "view_members")
    
    member = db.query(User).join(UserOrganization).filter(
        UserOrganization.organization_id == organization_id,
        User.id == member_id
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # TODO: Implement activity logging and retrieval
    return []
