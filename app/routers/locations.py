from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import List, Optional

from app.core.db import get_session
from app.models.location import Location

router = APIRouter(prefix="/locations", tags=["locations"])


@router.get("/search", response_model=List[dict])
async def search_locations(
    q: str = Query(..., min_length=2, description="Partial area name to search"),
    city: Optional[str] = Query(None, description="Filter by city name"),
    session: AsyncSession = Depends(get_session),
):
    """
    Search for location areas by partial name.

    Returns up to 10 results, with starts-with matches ranked above contains.
    Case-insensitive on Postgres via ILIKE.
    """
    # Build base query
    stmt = select(Location).where(
        Location.area_name.ilike(f"%{q}%")  # type: ignore[attr-defined]
    )

    if city:
        stmt = stmt.where(Location.city.ilike(f"%{city}%"))  # type: ignore[attr-defined]

    # Fetch up to 30 candidates, then re-rank in Python so starts-with comes first
    stmt = stmt.limit(30)
    result = await session.execute(stmt)
    locations = result.scalars().all()

    q_lower = q.lower()

    def rank(loc: Location) -> int:
        return 0 if loc.area_name.lower().startswith(q_lower) else 1

    ranked = sorted(locations, key=rank)[:10]

    return [
        {
            "id": loc.id,
            "city": loc.city,
            "area_name": loc.area_name,
            "lat": loc.lat,
            "lng": loc.lng,
        }
        for loc in ranked
    ]
