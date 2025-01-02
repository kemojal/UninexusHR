from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import User, UserOrganization

def get_by_email(db: Session, organization_id: int, email: str) -> Optional[User]:
    """Get a member by email in an organization"""
    return db.query(User).join(UserOrganization).filter(
        UserOrganization.organization_id == organization_id,
        User.email == email
    ).first()

def get_by_id(db: Session, organization_id: int, user_id: int) -> Optional[User]:
    """Get a member by ID in an organization"""
    return db.query(User).join(UserOrganization).filter(
        UserOrganization.organization_id == organization_id,
        User.id == user_id
    ).first()

def get_multi(
    db: Session,
    organization_id: int,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None
) -> List[User]:
    """Get multiple members in an organization with optional status filter"""
    query = db.query(User).join(UserOrganization).filter(
        UserOrganization.organization_id == organization_id
    )
    if status:
        query = query.filter(User.status == status)
    return query.offset(skip).limit(limit).all()
