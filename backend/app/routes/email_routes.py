"""
Email Routes
Handles email-related endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.services.email_service import email_service

router = APIRouter(prefix="/email", tags=["email"])

class WelcomeEmailRequest(BaseModel):
    email: EmailStr
    name: str

@router.post("/send-welcome")
async def send_welcome_email(request: WelcomeEmailRequest):
    """
    Send welcome email to user
    
    Args:
        request: Email and name of user
        
    Returns:
        Success message
    """
    try:
        success = email_service.send_welcome_email(
            to_email=request.email,
            user_name=request.name
        )
        
        if success:
            return {
                "message": "Welcome email sent successfully",
                "email": request.email
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to send welcome email"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error sending welcome email: {str(e)}"
        )

@router.get("/test")
async def test_email_service():
    """Test endpoint to check if email service is configured"""
    return {
        "status": "ok",
        "message": "Email service is running",
        "smtp_configured": bool(email_service.smtp_user and email_service.smtp_password)
    }
