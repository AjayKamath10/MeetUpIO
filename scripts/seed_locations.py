"""
Seed script to populate the locations table with neighbourhoods/suburbs
from major Indian cities, sourced from the OpenStreetMap Nominatim API.

Usage:
    cd /home/ajvkam/Documents/MeetUpIO/MeetUpIO
    source venv/bin/activate
    python scripts/seed_locations.py

Notes:
- Nominatim requires a valid User-Agent and a max rate of 1 request/sec.
- Script is idempotent: truncates the table before inserting.
- Expects DATABASE_URL in .env (same as the main app).
"""

import asyncio
import time
import urllib.request
import urllib.parse
import json
import sys
import os

# Ensure project root is in path so app imports resolve
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from sqlmodel import SQLModel, delete
from app.core.config import settings
from app.models.location import Location

# ---------------------------------------------------------------------------
# Target cities
# ---------------------------------------------------------------------------
CITIES = [
    {"name": "Bengaluru", "osm_name": "Bengaluru"},
    {"name": "Mumbai",    "osm_name": "Mumbai"},
    {"name": "Delhi",     "osm_name": "Delhi"},
    {"name": "Hyderabad", "osm_name": "Hyderabad"},
    {"name": "Chennai",   "osm_name": "Chennai"},
    {"name": "Pune",      "osm_name": "Pune"},
    {"name": "Kolkata",   "osm_name": "Kolkata"},
    {"name": "Ahmedabad", "osm_name": "Ahmedabad"},
]

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "MeetUpIO/2.0 (seed-script; contact@meetupio.com)"


def fetch_areas(city_osm_name: str) -> list[dict]:
    """
    Fetch suburb/neighbourhood places for a city from Nominatim.
    Returns a list of dicts: {area_name, lat, lng}
    """
    results = []

    for place_type in ["suburb", "neighbourhood", "quarter"]:
        params = {
            "q": f"{place_type} in {city_osm_name}, India",
            "format": "json",
            "limit": 50,
            "addressdetails": 0,
            "featuretype": place_type,
        }
        url = f"{NOMINATIM_URL}?{urllib.parse.urlencode(params)}"
        request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})

        try:
            with urllib.request.urlopen(request, timeout=15) as response:
                data = json.loads(response.read().decode())
                for item in data:
                    name = item.get("display_name", "").split(",")[0].strip()
                    if name:
                        results.append({
                            "area_name": name,
                            "lat": float(item["lat"]),
                            "lng": float(item["lon"]),
                        })
        except Exception as e:
            print(f"    Warning: failed to fetch {place_type}s for {city_osm_name}: {e}")

        time.sleep(1)  # Nominatim rate limit: 1 req/sec

    # Deduplicate by area_name (case-insensitive)
    seen: set[str] = set()
    unique = []
    for r in results:
        key = r["area_name"].lower()
        if key not in seen:
            seen.add(key)
            unique.append(r)

    return unique


async def seed():
    _is_postgres = settings.DATABASE_URL.startswith("postgresql")
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        future=True,
        poolclass=NullPool if _is_postgres else None,
        connect_args={"ssl": "require"} if _is_postgres else {},
    )

    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    # Ensure the table exists
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    async with async_session() as session:
        # Clear existing data
        await session.execute(delete(Location))
        await session.commit()
        print("Cleared existing location data.\n")

        total = 0
        for city in CITIES:
            print(f"Fetching areas for {city['name']}...")
            areas = fetch_areas(city["osm_name"])
            print(f"  Found {len(areas)} unique areas.")

            for area in areas:
                loc = Location(
                    city=city["name"],
                    area_name=area["area_name"],
                    lat=area["lat"],
                    lng=area["lng"],
                )
                session.add(loc)

            await session.commit()
            total += len(areas)
            print(f"  Inserted {len(areas)} rows for {city['name']}.\n")

    print(f"✅ Seed complete. Total rows inserted: {total}")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
