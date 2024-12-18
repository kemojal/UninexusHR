from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from typing import List, Optional
from app.core.config import settings
import jinja2
import logging
from fastapi import HTTPException
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)

# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=settings.SMTP_USER,
    MAIL_PASSWORD=settings.SMTP_PASSWORD,
    MAIL_FROM=settings.EMAILS_FROM_EMAIL,
    MAIL_PORT=settings.SMTP_PORT,
    MAIL_SERVER=settings.SMTP_HOST,
    MAIL_FROM_NAME=settings.EMAILS_FROM_NAME,
    MAIL_SSL_TLS=settings.SMTP_TLS,
    MAIL_STARTTLS=settings.SMTP_TLS,
    USE_CREDENTIALS=True
) if settings.SMTP_USER and settings.SMTP_PASSWORD else None

# Initialize FastMail
fastmail = FastMail(conf) if conf else None

# Initialize Jinja2 template environment
template_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader('app/templates/email')
)

async def send_invitation_email(
    recipient_email: str,
    inviter_name: str,
    org_id: int,
    temp_password: Optional[str] = None
) -> None:
    """Send an invitation email to a new member"""
    try:
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USER
        msg['To'] = recipient_email
        msg['Subject'] = "Invitation to Join Organization"

        # Create email body based on whether it's a new user or existing user
        if temp_password:
            body = f"""
            Hello,

            {inviter_name} has invited you to join their organization on UninexusHR.
            
            To get started:
            1. Click this link to access the platform: {settings.FRONTEND_URL}/auth/login
            2. Use your email: {recipient_email}
            3. Use this temporary password: {temp_password}
            
            Please change your password immediately after logging in for security purposes.

            Best regards,
            The UninexusHR Team
            """
        else:
            body = f"""
            Hello,

            {inviter_name} has invited you to join their organization on UninexusHR.
            
            Please log in to your existing account to accept the invitation:
            {settings.FRONTEND_URL}/auth/login

            Best regards,
            The UninexusHR Team
            """

        msg.attach(MIMEText(body, 'plain'))

        # Create SMTP session
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        
        # Send email
        server.send_message(msg)
        server.quit()

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send invitation email: {str(e)}"
        )

async def send_join_request_notification(
    admin_email: EmailStr,
    user_name: str,
    organization_name: str
) -> None:
    """Notify admin about new join request"""
    if not fastmail:
        logger.warning("SMTP not configured. Skipping join request notification.")
        return

    template = template_env.get_template('join_request_notification.html')
    html = template.render(
        user_name=user_name,
        organization_name=organization_name,
        dashboard_link=f"{settings.FRONTEND_URL}/dashboard/members?tab=requests"
    )

    message = MessageSchema(
        subject=f"New join request for {organization_name}",
        recipients=[admin_email],
        body=html,
        subtype="html"
    )

    await fastmail.send_message(message)

async def send_join_request_status_update(
    user_email: EmailStr,
    organization_name: str,
    status: str
) -> None:
    """Notify user about their join request status update"""
    if not fastmail:
        logger.warning("SMTP not configured. Skipping status update notification.")
        return

    template = template_env.get_template('join_request_status.html')
    html = template.render(
        organization_name=organization_name,
        status=status,
        login_link=f"{settings.FRONTEND_URL}/login"
    )

    message = MessageSchema(
        subject=f"Update on your join request for {organization_name}",
        recipients=[user_email],
        body=html,
        subtype="html"
    )

    await fastmail.send_message(message)

async def send_reset_password_email(
    email_to: EmailStr,
    email: str,
    token: str
) -> None:
    """Send password reset email"""
    if not fastmail:
        logger.warning("SMTP not configured. Skipping password reset email.")
        return

    template = template_env.get_template('reset_password.html')
    html = template.render(
        reset_link=f"{settings.FRONTEND_URL}/reset-password?token={token}"
    )

    message = MessageSchema(
        subject="Password Reset Request",
        recipients=[email_to],
        body=html,
        subtype="html"
    )

    await fastmail.send_message(message)
