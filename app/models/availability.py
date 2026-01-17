from datetime import datetime
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field


class Availability(SQLModel, table=True):
    """Availability model representing time slots when a participant is available."""
    
    __tablename__ = "availabilities"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    participant_id: UUID = Field(foreign_key="participants.id", index=True)
    start_time: datetime
    end_time: datetime
