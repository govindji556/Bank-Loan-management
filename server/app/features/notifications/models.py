from sqlalchemy import String, ForeignKey, DateTime, Boolean, Enum as SQLAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from typing import Optional

from database import Base
from app.features.users.models import UserRole

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    target_role: Mapped[Optional[UserRole]] = mapped_column(SQLAEnum(UserRole), nullable=True, index=True)
    
    reference_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    
    message: Mapped[str] = mapped_column(String(500))
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))