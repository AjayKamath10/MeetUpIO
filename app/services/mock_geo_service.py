from typing import Dict, Optional

# Mock geocoding data for common Bengaluru locations
BENGALURU_LOCATIONS = {
    "whitefield": {"lat": 12.9698, "lng": 77.7499},
    "indiranagar": {"lat": 12.9716, "lng": 77.6412},
    "koramangala": {"lat": 12.9352, "lng": 77.6245},
    "mg road": {"lat": 12.9756, "lng": 77.6063},
    "mgroad": {"lat": 12.9756, "lng": 77.6063},
    "jp nagar": {"lat": 12.9091, "lng": 77.5855},
    "jpnagar": {"lat": 12.9091, "lng": 77.5855},
    "hsr layout": {"lat": 12.9121, "lng": 77.6446},
    "hsr": {"lat": 12.9121, "lng": 77.6446},
    "malleshwaram": {"lat": 13.0039, "lng": 77.5703},
    "electronic city": {"lat": 12.8456, "lng": 77.6603},
    "jayanagar": {"lat": 12.9250, "lng": 77.5838},
    "btm layout": {"lat": 12.9166, "lng": 77.6101},
    "btm": {"lat": 12.9166, "lng": 77.6101},
    "yeshwanthpur": {"lat": 13.0280, "lng": 77.5385},
    "hebbal": {"lat": 13.0358, "lng": 77.5970},
    "banashankari": {"lat": 12.9250, "lng": 77.5482},
    "rajajinagar": {"lat": 12.9915, "lng": 77.5552},
    "majestic": {"lat": 12.9767, "lng": 77.5711},
    "yelahanka": {"lat": 13.1007, "lng": 77.5963},
    "marathahalli": {"lat": 12.9591, "lng": 77.6974},
    "kr puram": {"lat": 13.0050, "lng": 77.6960},
    "krpuram": {"lat": 13.0050, "lng": 77.6960},
}

# Default fallback to central Bengaluru
DEFAULT_LOCATION = {"lat": 12.9716, "lng": 77.5946}


def geocode_location(location_name: str) -> Dict[str, float]:
    """
    Mock geocoding service for Bengaluru locations.
    
    In production, this would call a real geocoding API (Google Maps, Mapbox, etc.)
    For V1, we use hardcoded coordinates for common Bengaluru neighborhoods.
    
    Args:
        location_name: Name of the location (case-insensitive)
        
    Returns:
        Dictionary with 'lat' and 'lng' coordinates
    """
    normalized_name = location_name.lower().strip()
    
    # Try exact match
    if normalized_name in BENGALURU_LOCATIONS:
        return BENGALURU_LOCATIONS[normalized_name]
    
    # Try partial match
    for key, coords in BENGALURU_LOCATIONS.items():
        if key in normalized_name or normalized_name in key:
            return coords
    
    # Fallback to central Bengaluru
    return DEFAULT_LOCATION


def get_neighborhood_name(lat: float, lng: float) -> str:
    """
    Reverse geocode coordinates to get neighborhood name.
    
    For V1, we find the closest known location from our mock data.
    
    Args:
        lat: Latitude
        lng: Longitude
        
    Returns:
        Neighborhood name as a string
    """
    min_distance = float('inf')
    closest_name = "Bengaluru Central"
    
    for name, coords in BENGALURU_LOCATIONS.items():
        # Simple distance calculation (Euclidean approximation)
        distance = ((lat - coords["lat"]) ** 2 + (lng - coords["lng"]) ** 2) ** 0.5
        if distance < min_distance:
            min_distance = distance
            closest_name = name.title()
    
    return closest_name
