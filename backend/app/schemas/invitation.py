from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime

class InvitationBase(BaseModel):
    email: EmailStr
    role_id: int

class InvitationCreate(InvitationBase):
    pass

class InvitationUpdate(BaseModel):
    is_accepted: bool

class InvitedBy(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    full_name: str

class InvitationResponse(InvitationBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    organization_id: int
    is_accepted: bool
    expires_at: datetime
    created_at: datetime
    invited_by: InvitedBy
