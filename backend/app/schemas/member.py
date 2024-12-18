from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class RoleInfo(BaseModel):
    id: int
    name: str

class MemberBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class MemberCreate(MemberBase):
    password: str
    role_ids: List[int]

class MemberUpdate(BaseModel):
    full_name: Optional[str] = None
    role_ids: Optional[List[int]] = None
    is_active: Optional[bool] = None

class InvitationCreate(BaseModel):
    email: EmailStr
    role_id: int

class MemberResponse(MemberBase):
    id: int
    organization_id: int
    is_active: bool
    roles: List[RoleInfo]
    last_active: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
