import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging
from email.utils import formataddr

from app.core.config import settings

logger = logging.getLogger(__name__)

def create_invitation_email(recipient_email: str, organization_name: str, token: str) -> MIMEMultipart:
    """Create a beautifully designed HTML invitation email."""
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f"Join {organization_name} on UninexusHR"
    msg['From'] = formataddr(("UninexusHR", settings.SMTP_USER))
    msg['To'] = recipient_email
    
    # Create the correct invitation URL
    # invitation_url = f"http://localhost:3000/join?token={token}"
    invitation_url = f"{settings.FRONTEND_URL}/join?token={token}"

    
    # HTML version of the email
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Join {organization_name}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f7f7f7;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: auto; padding: 40px 20px;">
            <tr>
                <td style="padding: 20px 0; text-align: center;">
                    <img src="https://uninexushr.com/logo.png" alt="UninexusHR Logo" style="height: 40px; margin-bottom: 20px;">
                </td>
            </tr>
            <tr>
                <td style="background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <h1 style="margin: 0 0 30px; font-size: 24px; font-weight: 600; color: #1a1a1a; text-align: center;">
                        You're invited to join {organization_name}
                    </h1>
                    
                    <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #4a4a4a; text-align: center;">
                        {organization_name} is using UninexusHR to streamline their HR operations and enhance team collaboration. Join your team to get started.
                    </p>
                    
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="{invitation_url}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px; transition: all 0.2s ease;">
                            Accept Invitation
                        </a>
                    </div>
                    
                    <p style="margin: 24px 0 0; font-size: 14px; color: #6b7280; text-align: center;">
                        This invitation will expire in 7 days. If you're having trouble with the button above, copy and paste this URL into your browser:
                    </p>
                    
                    <p style="margin: 8px 0 0; font-size: 14px; color: #4a4a4a; text-align: center; word-break: break-all;">
                        <a href="{invitation_url}" style="color: #2563eb; text-decoration: none;">{invitation_url}</a>
                    </p>
                </td>
            </tr>
            <tr>
                <td style="padding: 24px 0; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">
                        UninexusHR · The Future of HR Management
                    </p>
                    <p style="margin: 8px 0 0; font-size: 13px; color: #9ca3af;">
                        San Francisco, CA · <a href="https://uninexushr.com" style="color: #2563eb; text-decoration: none;">uninexushr.com</a>
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    
    # Plain text version as fallback
    text = f"""
    Join {organization_name} on UninexusHR

    You've been invited to join {organization_name} on UninexusHR. 
    
    Click the following link to accept the invitation:
    {invitation_url}
    
    This invitation link will expire in 7 days.

    Best regards,
    The UninexusHR Team
    """
    
    part1 = MIMEText(text, 'plain')
    part2 = MIMEText(html, 'html')
    
    msg.attach(part1)
    msg.attach(part2)
    
    return msg

def send_invitation_email(email_to: str, invitation_url: str, organization_name: str) -> None:
    """Send an invitation email to a new member"""
    try:
        logger.info(f"Preparing to send invitation email to {email_to} for {organization_name}")
        
        msg = create_invitation_email(email_to, organization_name, invitation_url)
        
        logger.info(f"Connecting to SMTP server {settings.SMTP_HOST}:{settings.SMTP_PORT}")
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.set_debuglevel(1)  # Enable SMTP debug output
        
        logger.info("Starting TLS")
        server.starttls()
        
        logger.info(f"Logging in with user {settings.SMTP_USER}")
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        
        text = msg.as_string()
        logger.info(f"Sending email from {settings.SMTP_USER} to {email_to}")
        server.sendmail(settings.SMTP_USER, email_to, text)
        
        server.quit()
        logger.info("Email sent successfully")

    except Exception as e:
        logger.error(f"Failed to send invitation email to {email_to}: {str(e)}")
        logger.exception("Full traceback:")
        raise Exception(f"Failed to send invitation email: {str(e)}")

def send_join_request_notification(admin_email: str, user_name: str, organization_name: str) -> None:
    """Send notification to admin about new join request"""
    try:
        logger.info(f"Preparing to send join request notification to {admin_email} for {organization_name}")
        
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USER
        msg['To'] = admin_email
        msg['Subject'] = f"New join request for {organization_name}"

        body = f"""
        Hello,

        {user_name} has requested to join {organization_name}.
        
        You can review this request in your dashboard:
        {settings.FRONTEND_URL}/dashboard/members?tab=requests

        Best regards,
        The UninexusHR Team
        """

        msg.attach(MIMEText(body, 'plain'))

        logger.info(f"Connecting to SMTP server {settings.SMTP_HOST}:{settings.SMTP_PORT}")
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.set_debuglevel(1)  # Enable SMTP debug output
        
        logger.info("Starting TLS")
        server.starttls()
        
        logger.info(f"Logging in with user {settings.SMTP_USER}")
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        
        text = msg.as_string()
        logger.info(f"Sending email from {settings.SMTP_USER} to {admin_email}")
        server.sendmail(settings.SMTP_USER, admin_email, text)
        
        server.quit()
        logger.info("Email sent successfully")

    except Exception as e:
        logger.error(f"Failed to send join request notification to {admin_email}: {str(e)}")
        logger.exception("Full traceback:")
        raise Exception(f"Failed to send join request notification: {str(e)}")

def send_join_request_status_update(user_email: str, organization_name: str, status: str) -> None:
    """Send notification to user about their join request status"""
    try:
        logger.info(f"Preparing to send join request status update to {user_email} for {organization_name}")
        
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USER
        msg['To'] = user_email
        msg['Subject'] = f"Update on your join request for {organization_name}"

        body = f"""
        Hello,

        Your request to join {organization_name} has been {status}.
        
        {"You can now log in to access the organization." if status == "approved" else ""}
        {settings.FRONTEND_URL}/login

        Best regards,
        The UninexusHR Team
        """

        msg.attach(MIMEText(body, 'plain'))

        logger.info(f"Connecting to SMTP server {settings.SMTP_HOST}:{settings.SMTP_PORT}")
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.set_debuglevel(1)  # Enable SMTP debug output
        
        logger.info("Starting TLS")
        server.starttls()
        
        logger.info(f"Logging in with user {settings.SMTP_USER}")
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        
        text = msg.as_string()
        logger.info(f"Sending email from {settings.SMTP_USER} to {user_email}")
        server.sendmail(settings.SMTP_USER, user_email, text)
        
        server.quit()
        logger.info("Email sent successfully")

    except Exception as e:
        logger.error(f"Failed to send join request status update to {user_email}: {str(e)}")
        logger.exception("Full traceback:")
        raise Exception(f"Failed to send join request status update: {str(e)}")

def send_reset_password_email(email_to: str, token: str) -> None:
    """Send password reset email"""
    try:
        logger.info(f"Preparing to send password reset email to {email_to}")
        
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USER
        msg['To'] = email_to
        msg['Subject'] = "Password Reset Request"

        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        body = f"""
        Hello,

        You have requested to reset your password.
        
        Click the following link to reset your password:
        {reset_url}
        
        This link will expire in 24 hours.
        
        If you did not request this password reset, please ignore this email.

        Best regards,
        The UninexusHR Team
        """

        msg.attach(MIMEText(body, 'plain'))

        logger.info(f"Connecting to SMTP server {settings.SMTP_HOST}:{settings.SMTP_PORT}")
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.set_debuglevel(1)  # Enable SMTP debug output
        
        logger.info("Starting TLS")
        server.starttls()
        
        logger.info(f"Logging in with user {settings.SMTP_USER}")
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        
        text = msg.as_string()
        logger.info(f"Sending email from {settings.SMTP_USER} to {email_to}")
        server.sendmail(settings.SMTP_USER, email_to, text)
        
        server.quit()
        logger.info("Email sent successfully")

    except Exception as e:
        logger.error(f"Failed to send password reset email to {email_to}: {str(e)}")
        logger.exception("Full traceback:")
        raise Exception(f"Failed to send password reset email: {str(e)}")

def send_welcome_email(email_to: str, temp_password: Optional[str] = None) -> None:
    """Send welcome email to new user"""
    try:
        logger.info(f"Preparing to send welcome email to {email_to}")
        
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USER
        msg['To'] = email_to
        msg['Subject'] = "Welcome to UninexusHR"

        body = f"""
        Welcome to UninexusHR!

        {"Your temporary password is: " + temp_password if temp_password else ""}
        
        Please log in and change your password as soon as possible.
        
        {settings.FRONTEND_URL}/login

        Best regards,
        The UninexusHR Team
        """

        msg.attach(MIMEText(body, 'plain'))

        logger.info(f"Connecting to SMTP server {settings.SMTP_HOST}:{settings.SMTP_PORT}")
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.set_debuglevel(1)  # Enable SMTP debug output
        
        logger.info("Starting TLS")
        server.starttls()
        
        logger.info(f"Logging in with user {settings.SMTP_USER}")
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        
        text = msg.as_string()
        logger.info(f"Sending email from {settings.SMTP_USER} to {email_to}")
        server.sendmail(settings.SMTP_USER, email_to, text)
        
        server.quit()
        logger.info("Email sent successfully")

    except Exception as e:
        logger.error(f"Failed to send welcome email to {email_to}: {str(e)}")
        logger.exception("Full traceback:")
        raise Exception(f"Failed to send welcome email: {str(e)}")
