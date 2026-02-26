from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional


class SuggestedTime(BaseModel):
    """Schema for suggested time window."""
    start: datetime
    end: datetime
    participant_count: int


class SuggestedLocation(BaseModel):
    """Schema for suggested meeting location (centroid)."""
    lat: float
    lng: float
    neighborhood: str


class VenueRecommendation(BaseModel):
    """Schema for venue recommendation."""
    name: str
    type: str
    description: str
    estimated_price: str
    address: Optional[str] = None
    rating: Optional[float] = None
    maps_url: Optional[str] = None


class ResultsResponse(BaseModel):
    """Schema for event results response."""
    event_title: str
    suggested_time: Optional[SuggestedTime]
    suggested_location: Optional[SuggestedLocation]
    venue_recommendations: List[VenueRecommendation]
    total_participants: int
