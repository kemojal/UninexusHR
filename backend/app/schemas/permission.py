from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class PermissionBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str = "other"

class PermissionCreate(PermissionBase):
    pass

class PermissionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None

class PermissionResponse(PermissionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    created_at: datetime
    updated_at: datetime
