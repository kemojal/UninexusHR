from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.base import TimestampMixin
from app.models.associations import role_permissions

class Permission(Base, TimestampMixin):
    __tablename__ = "permissions"
    __table_args__ = (
        UniqueConstraint('name', 'organization_id', name='uix_permission_name_org'),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    category = Column(String, nullable=False, default="other")
    organization_id = Column(Integer, ForeignKey('organizations.id'), nullable=False)
    
    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")
    organization = relationship("Organization", back_populates="permissions")
