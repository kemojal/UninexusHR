import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.schemas.user import UserCreate
from app.crud.crud_user import user

def init() -> None:
    db = SessionLocal()
    user_in = UserCreate(
        email="admin@uninexushr.com",
        password="admin123",  # Change this in production
        is_superuser=True,
        full_name="Admin User"
    )
    user_obj = user.get_by_email(db, email=user_in.email)
    if not user_obj:
        user.create(db, obj_in=user_in)
        print("Superuser created successfully")
    else:
        print("Superuser already exists")

if __name__ == "__main__":
    init()
