from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.base import TimestampMixin

class JoinRequest(Base, TimestampMixin):
    __tablename__ = "join_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    status = Column(String, default="pending")  # pending, approved, rejected
    
    user = relationship("User", back_populates="join_requests", foreign_keys=[user_id])
    organization = relationship("Organization", back_populates="join_requests", foreign_keys=[organization_id])
