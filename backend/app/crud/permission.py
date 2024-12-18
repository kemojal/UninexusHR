from typing import List, Optional
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.permission import Permission
from app.schemas.permission import PermissionCreate, PermissionUpdate


class CRUDPermission(CRUDBase[Permission, PermissionCreate, PermissionUpdate]):
    def create(self, db: Session, *, obj_in: PermissionCreate, organization_id: int) -> Permission:
        db_obj = Permission(
            name=obj_in.name,
            description=obj_in.description,
            organization_id=organization_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_organization(
        self,
        db: Session,
        *,
        organization_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Permission]:
        return db.query(Permission)\
            .filter(Permission.organization_id == organization_id)\
            .offset(skip)\
            .limit(limit)\
            .all()


permission = CRUDPermission(Permission)
