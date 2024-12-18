from fastapi import APIRouter, Depends, HTTPException, Query, Body
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.schemas.member import MemberCreate, MemberUpdate, MemberResponse, InvitationCreate
from app.models.user_organization import UserOrganization
from app.models.role import Role
from app.models.user import User
from app.core.security import get_password_hash
from app.utils.email import send_invitation_email
from app.utils.permissions import check_permission
from datetime import datetime, timedelta
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
        query = query.join(Role, UserOrganization.role_id == Role.id).filter(Role.name == role)
        
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
        # Get the roles for this user in this organization
        roles = (
            db.query(Role)
            .join(UserOrganization, UserOrganization.role_id == Role.id)
            .filter(
                UserOrganization.user_id == user.id,
                UserOrganization.organization_id == organization_id
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Invite a new member to the organization"""
    check_permission(current_user, organization_id, "invite_members")
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == invitation.email).first()
    if existing_user:
        # Check if user is already in the organization
        existing_membership = db.query(UserOrganization).filter(
            UserOrganization.user_id == existing_user.id,
            UserOrganization.organization_id == organization_id
        ).first()
        if existing_membership:
            raise HTTPException(
                status_code=400,
                detail="User is already a member of this organization"
            )
        user = existing_user
    else:
        # Generate a temporary password for the new user
        temp_password = generate_temp_password()
        hashed_password = get_password_hash(temp_password)
        
        # Create new user
        user = User(
            email=invitation.email,
            hashed_password=hashed_password,  # Set the hashed temporary password
            is_active=False,
            status="INVITED",
            full_name=""  # Empty string instead of null
        )
        db.add(user)
        db.flush()
    
    # Check if role exists and belongs to the organization
    role = db.query(Role).filter(
        Role.id == invitation.role_id,
        Role.organization_id == organization_id
    ).first()
    if not role:
        raise HTTPException(
            status_code=404,
            detail="Role not found or does not belong to this organization"
        )
    
    # Create user organization membership with role
    user_org = UserOrganization(
        user_id=user.id,
        organization_id=organization_id,
        role_id=role.id
    )
    db.add(user_org)
    
    try:
        db.commit()
        # Send invitation email with the temporary password if it's a new user
        if not existing_user:
            await send_invitation_email(
                user.email, 
                current_user.full_name, 
                organization_id,
                temp_password  # Pass the temporary password to the email function
            )
        else:
            await send_invitation_email(
                user.email,
                current_user.full_name,
                organization_id
            )
        return {"message": "Invitation sent successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send invitation: {str(e)}"
        )

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

@router.put("/members/{member_id}/roles")
async def update_member_roles(
    organization_id: int,
    member_id: int,
    role_ids: List[int] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update member roles"""
    check_permission(current_user, organization_id, "manage_members")
    
    member_org = db.query(UserOrganization).filter(
        UserOrganization.user_id == member_id,
        UserOrganization.organization_id == organization_id
    ).first()
    
    if not member_org:
        raise HTTPException(status_code=404, detail="Member not found")
    
    roles = db.query(Role).filter(
        Role.id.in_(role_ids),
        Role.organization_id == organization_id
    ).all()
    
    if not roles:
        raise HTTPException(status_code=404, detail="No valid roles found")
    
    member_org.role_id = roles[0].id
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
