#!/bin/bash

# Change to the backend directory
cd "$(dirname "$0")/.."

# Activate virtual environment
source venv/bin/activate

# Install build requirements
pip install --upgrade pip
pip install hatch

# Install required packages
pip install alembic psycopg2-binary pydantic-settings "pydantic[email]" python-dotenv "python-jose[cryptography]" passlib[bcrypt] fastapi uvicorn

# Install the app package in development mode
pip install -e .

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOL
DATABASE_URL=postgresql://postgres:postgres@localhost/uninexushr
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
EOL
fi

# Terminate existing connections and recreate database
psql -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'uninexushr';"
dropdb uninexushr || true
createdb uninexushr

# Remove existing alembic directory if it exists
rm -rf alembic/

# Initialize alembic
alembic init alembic

# Update alembic.ini to use our database URL
sed -i '' "s#sqlalchemy.url = driver://user:pass@localhost/dbname#sqlalchemy.url = postgresql://postgres:postgres@localhost/uninexushr#" alembic.ini

# Create a base.py file to import all models
cat > app/db/base.py << 'EOL'
from app.db.base_class import Base
from app.models.user import User
from app.models.organization import Organization
from app.models.join_request import JoinRequest
EOL

# Update alembic/env.py to use our models
cat > alembic/env.py << 'EOL'
from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
from app.db.base import Base
import os
from dotenv import load_dotenv

load_dotenv()

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section)
    url = os.getenv("DATABASE_URL")
    if url:
        configuration["sqlalchemy.url"] = url

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
EOL

# Create initial migration
export PYTHONPATH=$PWD
alembic revision --autogenerate -m "Initial migration"

# Run migrations
alembic upgrade head

# Create initial superuser
python scripts/create_superuser.py

echo "Database setup completed!"
