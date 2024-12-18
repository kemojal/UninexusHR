from pydantic_settings import BaseSettings
from typing import Optional
import secrets

class Settings(BaseSettings):
    PROJECT_NAME: str = "UninexusHR"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost/uninexushr"
    ALGORITHM: str = "HS256"  # Algorithm for JWT token encoding
    
    # SMTP Settings
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_TLS: bool = True
    EMAILS_FROM_EMAIL: str = "noreply@uninexushr.com"
    EMAILS_FROM_NAME: str = "UninexusHR"
    
    # Frontend URL
    FRONTEND_URL: str = "http://localhost:3000"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
