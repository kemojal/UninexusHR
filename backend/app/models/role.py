from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.base import TimestampMixin
from app.models.associations import role_permissions, user_roles

class Role(Base, TimestampMixin):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    organization_id = Column(Integer, ForeignKey('organizations.id'), nullable=False)
    
    users = relationship("User", secondary=user_roles, back_populates="roles")
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")
    organization = relationship("Organization", back_populates="roles", foreign_keys=[organization_id])
    user_organizations = relationship("UserOrganization", back_populates="role")
