from typing import Any, Dict, Optional, Union, List
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.organization import Organization
from app.models.user_organization import UserOrganization
from app.schemas.organization import OrganizationCreate, OrganizationUpdate


class CRUDOrganization(CRUDBase[Organization, OrganizationCreate, OrganizationUpdate]):
    def create(self, db: Session, *, obj_in: OrganizationCreate) -> Organization:
        db_obj = Organization(
            name=obj_in.name,
            description=obj_in.description,
            industry=obj_in.industry
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: Organization,
        obj_in: Union[OrganizationUpdate, Dict[str, Any]]
    ) -> Organization:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def add_user_with_role(
        self,
        db: Session,
        *,
        org_id: int,
        user_id: int,
        role: str
    ) -> UserOrganization:
        """Add a user to an organization with a specific role."""
        db_obj = UserOrganization(
            organization_id=org_id,
            user_id=user_id,
            role=role
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove_user(
        self,
        db: Session,
        *,
        org_id: int,
        user_id: int
    ) -> bool:
        """Remove a user from an organization."""
        obj = db.query(UserOrganization).filter(
            UserOrganization.organization_id == org_id,
            UserOrganization.user_id == user_id
        ).first()
        if not obj:
            return False
        db.delete(obj)
        db.commit()
        return True

    def is_admin(
        self,
        db: Session,
        *,
        org_id: int,
        user_id: int
    ) -> bool:
        """Check if a user is an admin of an organization."""
        obj = db.query(UserOrganization).filter(
            UserOrganization.organization_id == org_id,
            UserOrganization.user_id == user_id,
            UserOrganization.role == "admin"
        ).first()
        return obj is not None

    def get_user_role(
        self,
        db: Session,
        *,
        org_id: int,
        user_id: int
    ) -> Optional[str]:
        """Get a user's role in an organization."""
        obj = db.query(UserOrganization).filter(
            UserOrganization.organization_id == org_id,
            UserOrganization.user_id == user_id
        ).first()
        return obj.role if obj else None

    def get_organization_users(
        self,
        db: Session,
        *,
        org_id: int
    ) -> List[UserOrganization]:
        """Get all users in an organization with their roles."""
        return db.query(UserOrganization).filter(
            UserOrganization.organization_id == org_id
        ).all()


organization = CRUDOrganization(Organization)
