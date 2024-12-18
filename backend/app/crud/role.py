from typing import List, Optional
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.role import Role
from app.models.permission import Permission
from app.schemas.role import RoleCreate, RoleUpdate


class CRUDRole(CRUDBase[Role, RoleCreate, RoleUpdate]):
    def create(self, db: Session, *, obj_in: RoleCreate, organization_id: int) -> Role:
        db_obj = Role(
            name=obj_in.name,
            description=obj_in.description,
            organization_id=organization_id
        )
        
        if obj_in.permission_ids:
            permissions = db.query(Permission).filter(
                Permission.id.in_(obj_in.permission_ids),
                Permission.organization_id == organization_id
            ).all()
            db_obj.permissions = permissions
        
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
    ) -> List[Role]:
        return db.query(Role)\
            .filter(Role.organization_id == organization_id)\
            .offset(skip)\
            .limit(limit)\
            .all()


role = CRUDRole(Role)
