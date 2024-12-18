from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.base import TimestampMixin
from datetime import datetime, timezone

class Invitation(Base, TimestampMixin):
    __tablename__ = "invitations"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False, index=True)
    token = Column(String, unique=True, nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    invited_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    is_accepted = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)

    organization = relationship("Organization", back_populates="invitations")
    invited_by = relationship("User", back_populates="sent_invitations")
    role = relationship("Role")
