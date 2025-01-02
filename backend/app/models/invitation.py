from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.models.base import TimestampMixin

class Invitation(Base, TimestampMixin):
    __tablename__ = "invitations"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    invited_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    status = Column(String, default="pending")  # pending, accepted, expired
    token = Column(String, unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="invitations")
    invited_by = relationship("User", back_populates="sent_invitations")
    role = relationship("Role")

    @property
    def is_accepted(self) -> bool:
        return self.status == "accepted"

    @is_accepted.setter
    def is_accepted(self, value: bool):
        self.status = "accepted" if value else "pending"
