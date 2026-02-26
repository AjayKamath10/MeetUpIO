from sqlmodel import SQLModel, Field
from typing import Optional


class Location(SQLModel, table=True):
    """Location model representing a geocoded area/neighbourhood."""

    __tablename__ = "locations"

    id: Optional[int] = Field(default=None, primary_key=True)
    city: str = Field(index=True, max_length=100)
    area_name: str = Field(index=True, max_length=200)
    lat: float
    lng: float
