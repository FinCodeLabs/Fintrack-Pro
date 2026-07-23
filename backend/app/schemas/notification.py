from datetime import datetime
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime
    read_at: datetime | None
    action_url: str | None

    model_config = {"from_attributes": True}
