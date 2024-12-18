import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import engine
from app.models.base import Base
from app.models.models import User, Organization, JoinRequest  # Import all models

def init() -> None:
    Base.metadata.create_all(bind=engine)
    print("Created all database tables")

if __name__ == "__main__":
    init()
