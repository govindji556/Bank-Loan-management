from pydantic import BaseModel,Field,ConfigDict
from datetime import datetime

class NotificationResponse(BaseModel):
    id: int
    message: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)