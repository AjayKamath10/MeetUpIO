"""
Seed script to populate the locations table from a bundled static JSON file.

Usage:
    cd /home/ajvkam/Documents/MeetUpIO/MeetUpIO
    source venv/bin/activate
    python scripts/seed_locations.py
"""

import asyncio
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import SQLModel, delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import engine, async_session
from app.models.location import Location

DATA_FILE = os.path.join(os.path.dirname(__file__), "locations_data.json")


async def seed():
    # Ensure table exists
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    with open(DATA_FILE, "r") as f:
        data = json.load(f)

    async with async_session() as session:
        await session.execute(delete(Location))
        await session.commit()
        print(f"Cleared existing data. Inserting {len(data)} locations...\n")

        by_city: dict[str, list] = {}
        for row in data:
            by_city.setdefault(row["city"], []).append(row)

        for city, areas in by_city.items():
            for area in areas:
                session.add(Location(
                    city=city,
                    area_name=area["area_name"],
                    lat=area["lat"],
                    lng=area["lng"],
                ))
            await session.commit()
            print(f"  {city}: {len(areas)} areas inserted.")

    print(f"\n✅ Seed complete. Total rows: {len(data)}")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
