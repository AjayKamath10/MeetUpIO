from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional


class Participant(SQLModel, table=True):
    """Participant model representing someone joining an event."""
    
    __tablename__ = "participants"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    event_id: UUID = Field(foreign_key="events.id", index=True)
    name: str = Field(max_length=100)
    is_host: bool = Field(default=False)
    location_name: str = Field(max_length=200)
    lat: Optional[float] = Field(default=None)
    lng: Optional[float] = Field(default=None)
