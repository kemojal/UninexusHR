from setuptools import setup, find_packages

setup(
    name="uninexushr",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "psycopg2-binary",
        "alembic",
        "python-jose[cryptography]",
        "passlib[bcrypt]",
        "python-dotenv",
        "pydantic-settings",
        "pydantic[email]",
    ],
)
