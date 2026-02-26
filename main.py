import json
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlmodel import select

from app.core.config import settings
from app.core.db import init_db, async_session
from app.models.location import Location
from app.routers import events, locations


async def auto_seed_locations():
    """
    Populate the locations table from the bundled JSON if it is empty.
    Runs once on startup — safe to call on every deploy.
    """
    data_file = os.path.join(os.path.dirname(__file__), "scripts", "locations_data.json")
    if not os.path.exists(data_file):
        return

    async with async_session() as session:
        result = await session.execute(select(Location).limit(1))
        if result.scalar_one_or_none() is not None:
            return  # Already seeded

        with open(data_file) as f:
            data = json.load(f)

        for row in data:
            session.add(Location(
                city=row["city"],
                area_name=row["area_name"],
                lat=row["lat"],
                lng=row["lng"],
            ))
        await session.commit()
        print(f"[startup] Seeded {len(data)} locations.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events for the application."""
    await init_db()
    await auto_seed_locations()
    yield
    # Shutdown: Clean up resources if needed


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Friction-free social planning API - Find the perfect time and location overlap for your group",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(events.router, prefix="/api")
app.include_router(locations.router, prefix="/api")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME
    }


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Welcome to Midway API",
        "docs": "/docs",
        "health": "/health"
    }
