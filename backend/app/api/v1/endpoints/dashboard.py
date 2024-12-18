from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import crud, models
from app.api import deps
from app.models.user import User
from app.models.organization import Organization
from app.models.user_organization import UserOrganization

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get dashboard statistics
    """
    # Get total users count
    total_users = db.query(func.count(User.id)).scalar()

    # Get total organizations count
    total_organizations = db.query(func.count(Organization.id)).scalar()

    # Get total roles (unique roles across all organizations)
    total_roles = db.query(func.count(func.distinct(UserOrganization.role))).scalar()

    # Get pending requests count (placeholder for now)
    pending_requests = 0

    return {
        "total_users": total_users,
        "total_organizations": total_organizations,
        "total_roles": total_roles,
        "pending_requests": pending_requests
    }
