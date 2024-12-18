from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class JoinRequestBase(BaseModel):
    user_id: int
    organization_id: int
    status: Optional[str] = "pending"

class JoinRequestCreate(JoinRequestBase):
    pass

class JoinRequestUpdate(BaseModel):
    status: str

class JoinRequest(JoinRequestBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    updated_at: datetime
