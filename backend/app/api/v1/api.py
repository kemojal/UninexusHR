from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    users,
    organizations,
    roles,
    permissions,
    members
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["organizations"])
api_router.include_router(roles.router, prefix="/organizations/{organization_id}/roles", tags=["roles"])
api_router.include_router(permissions.router, prefix="/organizations/{organization_id}/permissions", tags=["permissions"])
api_router.include_router(members.router, prefix="/organizations/{organization_id}/members", tags=["members"])
