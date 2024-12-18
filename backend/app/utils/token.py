from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from app.core.config import settings

def generate_password_reset_token(email: str) -> str:
    """Generate a password reset token that expires in 24 hours"""
    delta = timedelta(hours=24)
    now = datetime.utcnow()
    expires = now + delta
    exp = expires.timestamp()
    encoded_jwt = jwt.encode(
        {"exp": exp, "nbf": now, "sub": email},
        settings.SECRET_KEY,
        algorithm="HS256",
    )
    return encoded_jwt

def verify_password_reset_token(token: str) -> Optional[str]:
    """Verify a password reset token and return the email if valid"""
    try:
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return decoded_token["sub"]
    except jwt.JWTError:
        return None
