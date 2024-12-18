from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.organization import Organization
from app.models.user import User
from app.models.join_request import JoinRequest
from app.schemas.organization import OrganizationCreate, OrganizationUpdate

class CRUDOrganization(CRUDBase[Organization, OrganizationCreate, OrganizationUpdate]):
    def get_by_name(self, db: Session, *, name: str) -> Optional[Organization]:
        return db.query(Organization).filter(Organization.name == name).first()

    def get_users(self, db: Session, *, org_id: int) -> List[User]:
        org = db.query(Organization).filter(Organization.id == org_id).first()
        if org:
            return org.users
        return []

    def add_user(self, db: Session, *, org_id: int, user_id: int) -> Optional[Organization]:
        org = db.query(Organization).filter(Organization.id == org_id).first()
        user = db.query(User).filter(User.id == user_id).first()
        if org and user:
            org.users.append(user)
            db.commit()
            db.refresh(org)
            return org
        return None

    def remove_user(self, db: Session, *, org_id: int, user_id: int) -> Optional[Organization]:
        org = db.query(Organization).filter(Organization.id == org_id).first()
        user = db.query(User).filter(User.id == user_id).first()
        if org and user:
            org.users.remove(user)
            db.commit()
            db.refresh(org)
            return org
        return None

    def get_join_requests(self, db: Session, *, org_id: int) -> List[JoinRequest]:
        return db.query(JoinRequest).filter(JoinRequest.organization_id == org_id).all()

    def create_join_request(
        self, db: Session, *, user_id: int, org_id: int, message: Optional[str] = None
    ) -> JoinRequest:
        join_request = JoinRequest(
            user_id=user_id,
            organization_id=org_id,
            message=message,
            status="pending"
        )
        db.add(join_request)
        db.commit()
        db.refresh(join_request)
        return join_request

    def update_join_request(
        self, db: Session, *, request_id: int, status: str
    ) -> Optional[JoinRequest]:
        join_request = db.query(JoinRequest).filter(JoinRequest.id == request_id).first()
        if join_request:
            join_request.status = status
            if status == "approved":
                self.add_user(
                    db=db,
                    org_id=join_request.organization_id,
                    user_id=join_request.user_id
                )
            db.commit()
            db.refresh(join_request)
            return join_request
        return None

organization = CRUDOrganization(Organization)
