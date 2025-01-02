from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

from app.schemas.permission import PermissionResponse

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    permission_ids: Optional[List[int]] = None
    organization_id: int

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permission_ids: Optional[List[int]] = None

class RoleResponse(RoleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    permissions: List[PermissionResponse]
    created_at: datetime
    updated_at: datetime
