from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.base import TimestampMixin

class UserOrganization(Base, TimestampMixin):
    __tablename__ = "user_organizations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    organization_id = Column(Integer, ForeignKey('organizations.id'))
    role_id = Column(Integer, ForeignKey('roles.id'))
    
    user = relationship("User", back_populates="user_organizations")
    organization = relationship("Organization", back_populates="user_organizations")
    role = relationship("Role", back_populates="user_organizations")
