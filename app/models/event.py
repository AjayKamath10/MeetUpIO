from datetime import datetime
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Index
from typing import Optional


class Event(SQLModel, table=True):
    """Event model representing a social planning event."""
    
    __tablename__ = "events"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    slug: str = Field(unique=True, index=True, max_length=50)
    title: str = Field(max_length=200)
    window_start: datetime
    window_end: datetime
    status: str = Field(default="PLANNING", max_length=50)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    __table_args__ = (
        Index("ix_event_slug", "slug"),
    )
