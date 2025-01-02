from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.invitation import Invitation
from app.schemas.invitation import InvitationCreate, InvitationUpdate
import secrets

class CRUDInvitation(CRUDBase[Invitation, InvitationCreate, InvitationUpdate]):
    def create(
        self, 
        db: Session, 
        *, 
        obj_in: InvitationCreate,
        organization_id: int,
        invited_by_id: int
    ) -> Invitation:
        expires_at = datetime.utcnow() + timedelta(days=7)  # Invitations expire in 7 days
        token = secrets.token_urlsafe(32)
        
        db_obj = Invitation(
            email=obj_in.email,
            role_id=obj_in.role_id,
            organization_id=organization_id,
            invited_by_id=invited_by_id,
            token=token,
            expires_at=expires_at,
            status="pending"
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_by_organization(
        self, 
        db: Session, 
        organization_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Invitation]:
        return (
            db.query(self.model)
            .filter(Invitation.organization_id == organization_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_token(
        self, 
        db: Session, 
        token: str
    ) -> Optional[Invitation]:
        return (
            db.query(self.model)
            .filter(Invitation.token == token)
            .first()
        )
    
    def get_pending_by_email(
        self, 
        db: Session, 
        organization_id: int,
        email: str
    ) -> Optional[Invitation]:
        """Get pending invitation by email for an organization"""
        return (
            db.query(self.model)
            .filter(
                Invitation.email == email,
                Invitation.organization_id == organization_id,
                Invitation.status == "pending",
                Invitation.expires_at > datetime.utcnow()
            )
            .first()
        )
    
    def get_multi_by_org(self, db: Session, *, organization_id: int) -> List[Invitation]:
        invitations = (
            db.query(self.model)
            .filter(self.model.organization_id == organization_id)
            .all()
        )
        
        # Add is_accepted property to each invitation
        for invitation in invitations:
            invitation.is_accepted = invitation.status == "accepted"
            
        return invitations
    
    def refresh(
        self,
        db: Session,
        *,
        db_obj: Invitation
    ) -> Invitation:
        """Refresh invitation token and expiry"""
        db_obj.token = secrets.token_urlsafe(32)
        db_obj.expires_at = datetime.utcnow() + timedelta(days=7)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

crud_invitation = CRUDInvitation(Invitation)
