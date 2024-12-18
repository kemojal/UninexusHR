from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.base import TimestampMixin
from app.models.enums import UserStatus
from app.models.associations import user_roles

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    status = Column(SQLEnum(UserStatus), default=UserStatus.PENDING)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    
    roles = relationship("Role", secondary=user_roles, back_populates="users")
    user_organizations = relationship("UserOrganization", back_populates="user")
    organizations = relationship(
        "Organization",
        secondary="user_organizations",
        back_populates="users",
        viewonly=True
    )
    join_requests = relationship("JoinRequest", back_populates="user")
    sent_invitations = relationship("Invitation", back_populates="invited_by")

    def has_permission(self, organization_id: int, permission_name: str) -> bool:
        """Check if user has a specific permission in an organization"""
        if self.is_superuser:
            return True
            
        # Find user's organization membership
        org_membership = next(
            (org for org in self.user_organizations if org.organization_id == organization_id),
            None
        )
        
        if not org_membership:
            return False
            
        # Check if any of the user's roles have the required permission
        for role in org_membership.roles:
            if any(perm.name == permission_name for perm in role.permissions):
                return True
                
        return False
