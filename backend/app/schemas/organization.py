from typing import Optional, List
from pydantic import BaseModel
from .user import User

class OrganizationBase(BaseModel):
    name: str
    industry: Optional[str] = None
    description: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationUpdate(OrganizationBase):
    pass

class Organization(OrganizationBase):
    id: int
    users: List[User] = []

    class Config:
        from_attributes = True

class UserOrganizationBase(BaseModel):
    role: str = "member"

class UserOrganizationCreate(UserOrganizationBase):
    user_id: int
    organization_id: int

class UserOrganization(UserOrganizationBase):
    id: int
    user: User
    organization: Organization

    class Config:
        from_attributes = True

class JoinRequestBase(BaseModel):
    message: Optional[str] = None

class JoinRequestCreate(JoinRequestBase):
    organization_id: int

class JoinRequestUpdate(JoinRequestBase):
    status: str

class JoinRequest(JoinRequestBase):
    id: int
    user_id: int
    organization_id: int
    status: str
    user: User
    
    class Config:
        from_attributes = True
