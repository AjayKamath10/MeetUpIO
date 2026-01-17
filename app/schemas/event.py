from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field
from typing import List


class EventCreate(BaseModel):
    """Schema for creating a new event."""
    title: str = Field(..., min_length=1, max_length=200)
    window_start: datetime
    window_end: datetime


class EventResponse(BaseModel):
    """Schema for event response."""
    id: UUID
    slug: str
    title: str
    window_start: datetime
    window_end: datetime
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class ParticipantBasic(BaseModel):
    """Basic participant info for event detail response."""
    id: UUID
    name: str
    location_name: str
    is_host: bool
    
    class Config:
        from_attributes = True


class EventDetailResponse(BaseModel):
    """Extended event response with participants."""
    id: UUID
    slug: str
    title: str
    window_start: datetime
    window_end: datetime
    status: str
    created_at: datetime
    participants: List[ParticipantBasic] = []
    
    class Config:
        from_attributes = True
