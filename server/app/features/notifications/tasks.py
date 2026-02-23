from database import AsyncSessionLocal # Use your actual import here
from app.features.notifications.models import Notification
from app.features.users.models import UserRole

async def notify_managers_of_new_loan(user_email: str, application_id: int):
    """Broadcasts a single notification to the entire Manager team."""
    async with AsyncSessionLocal() as db:
        new_notification = Notification(
            target_role=UserRole.MANAGER, 
            reference_id=f"loan_app_{application_id}", # Standardized Reference ID
            message=f"New loan application received from {user_email}."
        )
        db.add(new_notification)
        await db.commit()

async def notify_user_of_update(user_id: int, status: str):
    """Notifies the specific customer that their loan status changed."""
    async with AsyncSessionLocal() as db:
        # Dynamic message based on status
        msg = f"Great news! Your loan application has been {status.upper()}." if status.lower() == "approved" else f"Your loan application has been {status.upper()}."
        
        new_notification = Notification(
            user_id=user_id,
            message=msg
        )
        db.add(new_notification)
        await db.commit()