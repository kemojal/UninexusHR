#!/bin/bash

# Create database
psql -U postgres -c "CREATE DATABASE uninexushr"

# Initialize alembic
cd ../backend
alembic init alembic

# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Run migrations
alembic upgrade head

# Create initial superuser
python scripts/create_superuser.py
