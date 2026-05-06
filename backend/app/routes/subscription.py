from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Body, Query
from datetime import datetime, timedelta
from pydantic import BaseModel # type: ignore
from sqlalchemy.orm import Session # type: ignore
from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.subscription import Subscription

router = APIRouter(prefix="/api/subscription", tags=["subscription"])

# Premium plan pricing
PREMIUM_PLANS = {
    "monthly": {
        "duration_days": 30,
        "amount": 299,
        "name": "Standard Monthly"
    },
    "quarterly": {
        "duration_days": 90,
        "amount": 799,
        "name": "Pro Quarterly"
    },
    "yearly": {
        "duration_days": 365,
        "amount": 2499,
        "name": "Ultimate Yearly"
    }
}


class InitiatePaymentRequest(BaseModel):
    plan_id: str
    payment_method: str = "upi"

@router.get("/status")
async def get_subscription_status(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current subscription status"""
    # Query the actual user from database
    user = db.query(User).filter(User.email == current_user.get("email")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    premium_until = getattr(user, "premium_until", None)
    is_premium = bool(getattr(user, "is_premium", False))
    
    # Check if premium has expired
    if is_premium and premium_until and premium_until < datetime.utcnow():
        # Expire the premium status
        setattr(user, "is_premium", False)
        db.add(user)
        db.commit()
        is_premium = False
        premium_until = None
    
    days_remaining = 0
    if is_premium and premium_until:
        delta = (premium_until - datetime.utcnow()).days
        days_remaining = max(0, delta)
    
    return {
        "is_premium": is_premium,
        "premium_until": premium_until,
        "days_remaining": days_remaining
    }

@router.get("/plans")
async def get_subscription_plans():
    """Get available subscription plans"""
    plans = []
    for plan_key, plan_info in PREMIUM_PLANS.items():
        plans.append({
            "id": plan_key,
            "name": plan_info["name"],
            "amount": plan_info["amount"],
            "currency": "INR",
            "duration_days": plan_info["duration_days"],
            "description": f"Unlimited AI chats, garage maps, and premium features for {plan_info['duration_days']} days"
        })
    return plans

@router.post("/activate-demo")
async def activate_demo_subscription(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Activate a 10-day free trial for the current user"""
    user = db.query(User).filter(User.email == current_user.get("email")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if user has already used a demo
    if user.premium_until and user.premium_until > datetime.utcnow():
        raise HTTPException(status_code=400, detail="Premium subscription is already active.")

    # Activate 10-day demo
    user.is_premium = True
    user.premium_until = datetime.utcnow() + timedelta(days=10)
    db.add(user)
    db.commit()

    return {
        "message": "10-day premium demo activated successfully!",
        "premium_until": user.premium_until.isoformat(),
        "days_remaining": 10
    }

@router.post("/initiate-payment")
async def initiate_payment(
    payload: Optional[InitiatePaymentRequest] = Body(default=None),
    plan_id: Optional[str] = Query(default=None),
    payment_method: Optional[str] = Query(default=None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initiate payment for premium subscription (Demo mode)"""

    resolved_plan_id = payload.plan_id if payload else plan_id
    resolved_payment_method = payload.payment_method if payload else (payment_method or "upi")

    if not resolved_plan_id:
        raise HTTPException(status_code=400, detail="plan_id is required")
    
    if resolved_plan_id not in PREMIUM_PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    plan = PREMIUM_PLANS[resolved_plan_id]
    
    # Query the actual user from database
    user = db.query(User).filter(User.email == current_user.get("email")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # In production, integrate with actual payment gateway (Razorpay, Stripe, etc)
    # For demo, we'll simulate the payment
    
    transaction_id = f"TXN_{user.id}_{int(datetime.utcnow().timestamp())}"
    
    subscription = Subscription(
        user_id=user.id,
        plan_type=resolved_plan_id,
        amount=plan["amount"],
        transaction_id=transaction_id,
        status="pending",
        expired_at=datetime.utcnow() + timedelta(days=plan["duration_days"]),
        payment_method=resolved_payment_method
    )
    
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    
    return {
        "transaction_id": transaction_id,
        "amount": plan["amount"],
        "currency": "INR",
        "plan": resolved_plan_id,
        "payment_method": resolved_payment_method,
        "status": "pending",
        # In production, return payment gateway URL
        "payment_url": f"https://payment-gateway.com/pay/{transaction_id}"
    }

@router.post("/verify-payment/{transaction_id}")
async def verify_payment(
    transaction_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify payment and activate premium subscription"""
    
    # Query the actual user from database
    user = db.query(User).filter(User.email == current_user.get("email")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    subscription = db.query(Subscription).filter(
        Subscription.transaction_id == transaction_id,
        Subscription.user_id == user.id
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Demo mode: auto-verify all payments
    setattr(subscription, "status", "completed")
    
    # Activate premium for user
    setattr(user, "is_premium", True)
    setattr(user, "premium_until", getattr(subscription, "expired_at", None))
    
    db.add(subscription)
    db.add(user)
    db.commit()
    
    return {
        "status": "success",
        "message": "Premium subscription activated",
        "premium_until": user.premium_until,
        "plan": subscription.plan_type
    }
