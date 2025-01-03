from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.organization import Organization
from app.models.user import User
from app.models.join_request import JoinRequest
from app.schemas.organization import OrganizationCreate, OrganizationUpdate
from app.models.user_organization import UserOrganization
from app.models.role import Role
from app.models.permission import Permission

from app.models import user_roles, role_permissions
from sqlalchemy import and_

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

    def get(self, db: Session, id: int) -> Optional[Organization]:
        """Get organization by ID"""
        return db.query(Organization).filter(Organization.id == id).first()

    def is_admin(self, db: Session, *, org_id: int, user_id: int) -> bool:
        """Check if a user is an admin of an organization"""
        print(f"\n=== Checking admin status for user {user_id} in org {org_id} ===")

        # Check user_roles table for admin role in this organization
        admin_role = (
            db.query(Role)
            .join(user_roles, user_roles.c.role_id == Role.id)
            .filter(
                user_roles.c.user_id == user_id,
                user_roles.c.organization_id == org_id,
                Role.name.ilike("%admin%")
            )
            .first()
        )

        if admin_role:
            print(f"User {user_id} is an admin for org {org_id}")
            return True
            
        print(f"User {user_id} is not an admin for org {org_id}")
        return False

    def add_user_with_role(
        self, 
        db: Session, 
        *, 
        org_id: int, 
        user_id: int, 
        role: str
    ) -> Optional[UserOrganization]:
        """Add a user to an organization with a specific role."""
        try:
            print(f"org_id type: {type(org_id)}, value: {org_id}")
            # First, get or create the role
            role_obj = (
                db.query(Role)
                .filter(
                    and_(
                        Role.organization_id == org_id,
                        Role.name.ilike(f"%{role}%")
                    )
                )
                .first()
            )
            
            if not role_obj:
                # Create the role if it doesn't exist
                role_obj = Role(
                    name=role,
                    organization_id=org_id,
                    permissions=["*"]  # Default admin permissions
                )
                db.add(role_obj)
                db.flush()

            # Add the user-role relationship
            statement = user_roles.insert().values(
                user_id=user_id,
                role_id=role_obj.id,
                organization_id=org_id
            )
            db.execute(statement)
            
            # Add user to organization if not already added
            org = self.get(db=db, id=org_id)
            user = db.query(User).filter(User.id == user_id).first()
            if org and user and user not in org.users:
                org.users.append(user)
            
            db.commit()
            
            return db.query(UserOrganization).filter(
                and_(
                    UserOrganization.user_id == user_id,
                    UserOrganization.organization_id == org_id
                )
            ).first()
        except Exception as e:
            db.rollback()
            print(f"Error in add_user_with_role: {str(e)}")
            raise



    # def add_user_to_organization(
    #     self, db: Session, user_id: int, organization_id: int, role_id: int
    # ) -> UserOrganization:
    #     user_organization = UserOrganization(
    #         user_id=user_id,
    #         organization_id=organization_id,
    #         role_id=role_id,
    #     )
    #     db.add(user_organization)
    #     db.commit()
    #     db.refresh(user_organization)
    #     return user_organization
    def add_user_to_organization(
        self, db: Session, user_id: int, organization_id: int
    ) -> UserOrganization:
        """
        Add a user to the organization as an admin. Dynamically creates an 'admin' role
        for the organization, assigns all permissions to the role, and associates the user
        with the role.
        """
        # Check if an admin role already exists for the organization
        existing_role = db.query(Role).filter(
            Role.name == "admin", Role.organization_id == organization_id
        ).first()

        if not existing_role:
            # Create the admin role for the organization
            admin_role = Role(
                name="admin",
                description="Organization administrator with full access",
                organization_id=organization_id,
            )
            db.add(admin_role)
            db.commit()
            db.refresh(admin_role)

            # Fetch all permission IDs from the permissions table
            all_permissions = db.query(Permission.id).all()
            for permission in all_permissions:
                # Insert role-permission relationships into the table
                db.execute(
                    role_permissions.insert().values(
                        role_id=admin_role.id,
                        permission_id=permission.id,
                    )
                )
            db.commit()
        else:
            admin_role = existing_role

        # Add the user to the user_organization table with the admin role
        user_organization = UserOrganization(
            user_id=user_id,
            organization_id=organization_id,
            role_id=admin_role.id,
        )
        db.add(user_organization)
        db.commit()
        db.refresh(user_organization)

        return user_organization

crud_organization = CRUDOrganization(Organization)