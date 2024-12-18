from datetime import datetime, timedelta
from typing import Optional
import jwt
import logging

from app.core.config import settings

def generate_password_reset_token(email: str) -> str:
    delta = timedelta(hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS)
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
    try:
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return decoded_token["sub"]
    except jwt.JWTError:
        return None

def send_reset_password_email(email_to: str, email: str, token: str) -> None:
    """
    Send a password reset email to user.
    For now, we'll just log the token since we haven't set up email functionality yet.
    """
    logging.info(f"Password reset token for {email}: {token}")
    # TODO: Implement actual email sending functionality
