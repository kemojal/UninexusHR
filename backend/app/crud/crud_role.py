# backend/app/crud/crud_role.py

from typing import Optional, List
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.role import Role
from app.schemas.role import RoleCreate, RoleUpdate

class CRUDRole(CRUDBase[Role, RoleCreate, RoleUpdate]):
    def get_by_name(self, db: Session, *, name: str, organization_id: int) -> Optional[Role]:
        return db.query(Role).filter(
            Role.name == name,
            Role.organization_id == organization_id
        ).first()

    def get_organization_roles(
        self, db: Session, *, organization_id: int, skip: int = 0, limit: int = 100
    ) -> List[Role]:
        return db.query(Role).filter(
            Role.organization_id == organization_id
        ).offset(skip).limit(limit).all()

crud_role = CRUDRole(Role)