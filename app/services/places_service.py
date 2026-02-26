"""
Service for fetching venue recommendations from Google Places API.
"""
import httpx
from typing import List, Optional
from app.schemas.results import VenueRecommendation


PLACES_NEARBY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"

# Google Places type → human-readable category
PLACE_TYPE_LABELS: dict[str, str] = {
    "restaurant": "Restaurant",
    "cafe": "Café",
    "bar": "Bar",
    "bakery": "Bakery",
    "meal_takeaway": "Takeaway",
    "night_club": "Night Club",
    "food": "Food & Drink",
}

PRICE_LEVEL_MAP = {
    0: "Free",
    1: "₹",
    2: "₹₹",
    3: "₹₹₹",
    4: "₹₹₹₹",
}


def _build_maps_url(place_id: str) -> str:
    return f"https://www.google.com/maps/place/?q=place_id:{place_id}"


def _price_label(price_level: Optional[int]) -> str:
    if price_level is None:
        return "N/A"
    return PRICE_LEVEL_MAP.get(price_level, "₹₹")


def _venue_type_label(types: list[str]) -> str:
    for t in types:
        if t in PLACE_TYPE_LABELS:
            return PLACE_TYPE_LABELS[t]
    # Fallback: capitalise the first known type
    for t in types:
        if not t.startswith("point_of_interest") and not t.startswith("establishment"):
            return t.replace("_", " ").title()
    return "Venue"


async def fetch_venue_recommendations(
    lat: float,
    lng: float,
    api_key: str,
    radius_m: int = 2000,
    max_results: int = 3,
) -> List[VenueRecommendation]:
    """
    Call the Google Places Nearby Search API and return venue recommendations.

    Args:
        lat: Centroid latitude
        lng: Centroid longitude
        api_key: Google Places API key
        radius_m: Search radius in metres (default 2 km)
        max_results: Maximum number of venues to return

    Returns:
        List of VenueRecommendation objects
    """
    params = {
        "location": f"{lat},{lng}",
        "radius": radius_m,
        "type": "restaurant",
        "key": api_key,
        "rankby": "prominence",  # sort by prominence / rating
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(PLACES_NEARBY_URL, params=params)
        response.raise_for_status()
        data = response.json()

    results = data.get("results", [])
    venues: List[VenueRecommendation] = []

    for place in results[:max_results]:
        place_id = place.get("place_id", "")
        name = place.get("name", "Unknown")
        types: list[str] = place.get("types", [])
        vicinity = place.get("vicinity", "")  # short address
        rating: Optional[float] = place.get("rating")
        price_level: Optional[int] = place.get("price_level")
        user_ratings_total: Optional[int] = place.get("user_ratings_total")

        # Build a short description from available data
        description_parts = []
        if rating:
            description_parts.append(f"Rated {rating}/5")
            if user_ratings_total:
                description_parts.append(f"based on {user_ratings_total:,} reviews")
        if vicinity:
            description_parts.append(f"Located at {vicinity}")
        description = " · ".join(description_parts) if description_parts else "A popular venue nearby."

        venues.append(
            VenueRecommendation(
                name=name,
                type=_venue_type_label(types),
                description=description,
                estimated_price=_price_label(price_level),
                address=vicinity,
                rating=rating,
                maps_url=_build_maps_url(place_id) if place_id else None,
            )
        )

    return venues
