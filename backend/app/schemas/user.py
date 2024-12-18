from typing import Optional, List
from pydantic import BaseModel, EmailStr

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class Role(RoleBase):
    id: int
    organization_id: int

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False
    full_name: Optional[str] = None

class UserCreate(UserBase):
    email: EmailStr
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class User(UserBase):
    id: int
    organization_id: Optional[int] = None
    roles: List[Role] = []

    class Config:
        from_attributes = True

class UserInDB(User):
    hashed_password: str
