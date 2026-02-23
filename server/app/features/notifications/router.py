from fastapi import APIRouter, Depends
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, or_
from typing import List
from pydantic import BaseModel

from dependencies import get_db
from app.core.security import RequireRole, get_current_user
from app.features.users.models import User
from app.features.notifications.models import Notification
from app.features.notifications.schema import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/unread", response_model=List[NotificationResponse])
async def get_unread_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Notification).where(
        or_(
            Notification.user_id == current_user.id,
            Notification.target_role == current_user.role
        ),
        Notification.is_read == False
    ).order_by(Notification.created_at.desc())
    
    result = await db.execute(stmt)
    return result.scalars().all()

@router.patch("/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = update(Notification).where(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).values(is_read=True)
    
    await db.execute(stmt)
    await db.commit()
    return {"status": "success"}