from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field
from typing import List, Optional


class AvailabilityInput(BaseModel):
    """Schema for availability time slot input."""
    start_time: datetime
    end_time: datetime


class ParticipantCreate(BaseModel):
    """Schema for adding a participant to an event."""
    name: str = Field(..., min_length=1, max_length=100)
    location_name: str = Field(..., min_length=1, max_length=200)
    is_host: bool = False
    availabilities: List[AvailabilityInput] = Field(..., min_items=1)


class ParticipantResponse(BaseModel):
    """Schema for participant response."""
    id: UUID
    event_id: UUID
    name: str
    location_name: str
    is_host: bool
    lat: Optional[float]
    lng: Optional[float]
    
    class Config:
        from_attributes = True
