from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.deps import get_db, get_current_user
from app.models.join_request import JoinRequest
from app.models.organization_member import OrganizationMember
from app.models.user import User
from app.schemas.join_request import JoinRequestCreate, JoinRequest as JoinRequestSchema, JoinRequestUpdate
from app.utils.email import send_join_request_notification, send_join_request_status_update

router = APIRouter()

@router.post("/{org_id}/join-requests", response_model=JoinRequestSchema)
async def create_join_request(
    org_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new join request"""
    # Check if user is already a member
    existing_member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id,
        OrganizationMember.organization_id == org_id
    ).first()
    
    if existing_member:
        raise HTTPException(
            status_code=400,
            detail="You are already a member of this organization"
        )

    # Check if there's already a pending request
    existing_request = db.query(JoinRequest).filter(
        JoinRequest.user_id == current_user.id,
        JoinRequest.organization_id == org_id,
        JoinRequest.status == "pending"
    ).first()
    
    if existing_request:
        raise HTTPException(
            status_code=400,
            detail="You already have a pending join request"
        )

    # Create join request
    join_request = JoinRequest(
        user_id=current_user.id,
        organization_id=org_id,
        status="pending"
    )
    db.add(join_request)
    db.commit()
    db.refresh(join_request)

    # Notify organization admins
    organization = db.query(Organization).filter(Organization.id == org_id).first()
    admins = db.query(User).join(OrganizationMember).filter(
        OrganizationMember.organization_id == org_id,
        OrganizationMember.role.has(name="admin")
    ).all()

    for admin in admins:
        background_tasks.add_task(
            send_join_request_notification,
            admin.email,
            current_user.full_name,
            organization.name
        )

    return join_request

@router.get("/{org_id}/join-requests", response_model=List[JoinRequestSchema])
async def list_join_requests(
    org_id: int,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all join requests for an organization"""
    if not current_user.has_permission(org_id, "view_join_requests"):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    query = db.query(JoinRequest).filter(JoinRequest.organization_id == org_id)
    
    if status:
        query = query.filter(JoinRequest.status == status)
    
    return query.all()

@router.put("/{org_id}/join-requests/{request_id}", response_model=JoinRequestSchema)
async def update_join_request(
    org_id: int,
    request_id: int,
    request_update: JoinRequestUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update join request status (approve/reject)"""
    if not current_user.has_permission(org_id, "manage_join_requests"):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    join_request = db.query(JoinRequest).filter(
        JoinRequest.id == request_id,
        JoinRequest.organization_id == org_id
    ).first()

    if not join_request:
        raise HTTPException(status_code=404, detail="Join request not found")

    join_request.status = request_update.status
    join_request.updated_at = datetime.utcnow()

    if request_update.status == "approved":
        # Add user to organization
        member = OrganizationMember(
            user_id=join_request.user_id,
            organization_id=org_id,
            role_id=request_update.role_id  # Default role for new members
        )
        db.add(member)

    db.commit()
    db.refresh(join_request)

    # Notify user of the status update
    user = db.query(User).filter(User.id == join_request.user_id).first()
    organization = db.query(Organization).filter(Organization.id == org_id).first()
    
    background_tasks.add_task(
        send_join_request_status_update,
        user.email,
        organization.name,
        request_update.status
    )

    return join_request

@router.delete("/{org_id}/join-requests/{request_id}")
async def delete_join_request(
    org_id: int,
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a join request"""
    # Check if it's the user's own request or if they have permission
    join_request = db.query(JoinRequest).filter(
        JoinRequest.id == request_id,
        JoinRequest.organization_id == org_id
    ).first()

    if not join_request:
        raise HTTPException(status_code=404, detail="Join request not found")

    if join_request.user_id != current_user.id and not current_user.has_permission(org_id, "manage_join_requests"):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    db.delete(join_request)
    db.commit()

    return {"message": "Join request deleted successfully"}
