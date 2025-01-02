from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.base import TimestampMixin

class Organization(Base, TimestampMixin):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    industry = Column(String)
    description = Column(String, nullable=True)
    
    # Relationships
    users = relationship(
        "User",
        secondary="user_organizations",
        back_populates="organizations",
        viewonly=True
    )
    user_organizations = relationship("UserOrganization", back_populates="organization")
    roles = relationship("Role", back_populates="organization")
    invitations = relationship("Invitation", back_populates="organization")
    join_requests = relationship("JoinRequest", back_populates="organization")
    permissions = relationship("Permission", back_populates="organization")
