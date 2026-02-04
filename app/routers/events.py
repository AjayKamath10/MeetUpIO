from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from uuid import uuid4
from typing import List

from app.core.db import get_session
from app.models.event import Event
from app.models.participant import Participant
from app.models.availability import Availability
from app.schemas.event import EventCreate, EventResponse, EventDetailResponse, ParticipantBasic
from app.schemas.participant import ParticipantCreate, ParticipantResponse
from app.schemas.results import ResultsResponse, SuggestedTime, SuggestedLocation, VenueRecommendation
from app.services.algorithm_service import calculate_centroid, find_overlap
from app.services.mock_geo_service import geocode_location, get_neighborhood_name

router = APIRouter(prefix="/events", tags=["events"])


@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_data: EventCreate,
    session: AsyncSession = Depends(get_session)
):
    """
    Create a new event with a unique shareable slug.
    
    The slug is a short, URL-friendly identifier that can be shared via WhatsApp, etc.
    """
    # Generate a unique 8-character slug
    slug = uuid4().hex[:8]
    
    # Convert timezone-aware datetimes to naive UTC for database
    window_start = event_data.window_start.replace(tzinfo=None) if event_data.window_start.tzinfo else event_data.window_start
    window_end = event_data.window_end.replace(tzinfo=None) if event_data.window_end.tzinfo else event_data.window_end
    
    # Create event
    event = Event(
        slug=slug,
        title=event_data.title,
        window_start=window_start,
        window_end=window_end
    )
    
    session.add(event)
    await session.commit()
    await session.refresh(event)
    
    return event


@router.get("/{slug}", response_model=EventDetailResponse)
async def get_event(
    slug: str,
    session: AsyncSession = Depends(get_session)
):
    """
    Retrieve event details including all participants.
    """
    # Find event by slug
    result = await session.execute(
        select(Event).where(Event.slug == slug)
    )
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with slug '{slug}' not found"
        )
    
    # Get participants
    participants_result = await session.execute(
        select(Participant).where(Participant.event_id == event.id)
    )
    participants = participants_result.scalars().all()
    
    # Build response
    return EventDetailResponse(
        id=event.id,
        slug=event.slug,
        title=event.title,
        window_start=event.window_start,
        window_end=event.window_end,
        status=event.status,
        created_at=event.created_at,
        participants=[
            ParticipantBasic(
                id=p.id,
                name=p.name,
                location_name=p.location_name,
                is_host=p.is_host
            )
            for p in participants
        ]
    )


@router.post("/{slug}/join", response_model=ParticipantResponse, status_code=status.HTTP_201_CREATED)
async def join_event(
    slug: str,
    participant_data: ParticipantCreate,
    session: AsyncSession = Depends(get_session)
):
    """
    Add a participant to an event.
    
    This endpoint:
    1. Geocodes the participant's location
    2. Saves the participant
    3. Saves their availability time slots
    """
    # Find event
    result = await session.execute(
        select(Event).where(Event.slug == slug)
    )
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with slug '{slug}' not found"
        )
    
    # Geocode location
    coords = geocode_location(participant_data.location_name)
    
    # Create participant
    participant = Participant(
        event_id=event.id,
        name=participant_data.name,
        location_name=participant_data.location_name,
        is_host=participant_data.is_host,
        lat=coords["lat"],
        lng=coords["lng"]
    )
    
    session.add(participant)
    await session.commit()
    await session.refresh(participant)
    
    # Create availability slots
    for availability_input in participant_data.availabilities:
        # Convert timezone-aware datetimes to naive UTC for database
        start_time = availability_input.start_time.replace(tzinfo=None) if availability_input.start_time.tzinfo else availability_input.start_time
        end_time = availability_input.end_time.replace(tzinfo=None) if availability_input.end_time.tzinfo else availability_input.end_time
        
        availability = Availability(
            participant_id=participant.id,
            start_time=start_time,
            end_time=end_time
        )
        session.add(availability)
    
    await session.commit()
    
    return participant


@router.get("/{slug}/results", response_model=ResultsResponse)
async def get_results(
    slug: str,
    session: AsyncSession = Depends(get_session)
):
    """
    Calculate and return the "magic" results:
    - Best time window (maximum overlap)
    - Geographic centroid (fair meeting point)
    - Venue recommendations
    """
    # Find event
    result = await session.execute(
        select(Event).where(Event.slug == slug)
    )
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with slug '{slug}' not found"
        )
    
    # Get all participants
    participants_result = await session.execute(
        select(Participant).where(Participant.event_id == event.id)
    )
    participants = list(participants_result.scalars().all())
    
    if not participants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No participants have joined this event yet"
        )
    
    # Get all availabilities
    participant_ids = [p.id for p in participants]
    availabilities_result = await session.execute(
        select(Availability).where(Availability.participant_id.in_(participant_ids))
    )
    availabilities = list(availabilities_result.scalars().all())
    
    # Calculate suggested time
    suggested_time = None
    if availabilities:
        overlap = find_overlap(availabilities)
        if overlap:
            suggested_time = SuggestedTime(
                start=overlap["start"],
                end=overlap["end"],
                participant_count=overlap["count"]
            )
    
    # Calculate suggested location (centroid)
    suggested_location = None
    centroid = calculate_centroid(participants)
    if centroid:
        neighborhood = get_neighborhood_name(centroid["lat"], centroid["lng"])
        suggested_location = SuggestedLocation(
            lat=centroid["lat"],
            lng=centroid["lng"],
            neighborhood=neighborhood
        )
    
    # Mock venue recommendations (static for V1)
    venue_recommendations = [
        VenueRecommendation(
            name="Toit Brewpub",
            type="Brewery & Restaurant",
            description="Popular microbrewery with craft beers and continental cuisine",
            estimated_price="₹₹₹"
        ),
        VenueRecommendation(
            name="Truffles",
            type="Cafe & Restaurant",
            description="Iconic burger joint known for its massive burgers and casual vibe",
            estimated_price="₹₹"
        ),
        VenueRecommendation(
            name="The Fatty Bao",
            type="Asian Gastrobar",
            description="Modern Asian restaurant with innovative small plates and cocktails",
            estimated_price="₹₹₹"
        )
    ]
    
    return ResultsResponse(
        event_title=event.title,
        suggested_time=suggested_time,
        suggested_location=suggested_location,
        venue_recommendations=venue_recommendations,
        total_participants=len(participants)
    )
