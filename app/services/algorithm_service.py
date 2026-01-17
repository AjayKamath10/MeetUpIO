from datetime import datetime
from typing import List, Dict, Optional
from app.models.participant import Participant
from app.models.availability import Availability


def calculate_centroid(participants: List[Participant]) -> Optional[Dict[str, float]]:
    """
    Calculate the geographic centroid (center point) from participant locations.
    
    Args:
        participants: List of participants with lat/lng coordinates
        
    Returns:
        Dictionary with 'lat' and 'lng' keys, or None if no valid coordinates
    """
    valid_coords = [
        (p.lat, p.lng) 
        for p in participants 
        if p.lat is not None and p.lng is not None
    ]
    
    if not valid_coords:
        return None
    
    # Calculate simple arithmetic mean (suitable for city-scale distances)
    avg_lat = sum(lat for lat, _ in valid_coords) / len(valid_coords)
    avg_lng = sum(lng for _, lng in valid_coords) / len(valid_coords)
    
    return {
        "lat": avg_lat,
        "lng": avg_lng
    }


def find_overlap(availabilities: List[Availability]) -> Optional[Dict]:
    """
    Find the time window where the maximum number of participants overlap.
    
    Algorithm:
    1. Create a list of all time points (start and end times)
    2. Sort them chronologically
    3. Track how many people are available at each interval
    4. Return the longest interval with the highest participant count
    
    Args:
        availabilities: List of availability time slots
        
    Returns:
        Dictionary with 'start', 'end' (datetime), and 'count' (int) of participants,
        or None if no availabilities exist
    """
    if not availabilities:
        return None
    
    # Create events for each time point (start = +1 person, end = -1 person)
    events = []
    for avail in availabilities:
        events.append((avail.start_time, 1))  # Person becomes available
        events.append((avail.end_time, -1))   # Person becomes unavailable
    
    # Sort events by time
    events.sort(key=lambda x: x[0])
    
    # Track overlaps
    current_count = 0
    max_count = 0
    best_start = None
    best_end = None
    interval_start = None
    
    for i, (time, delta) in enumerate(events):
        # Update count
        prev_count = current_count
        current_count += delta
        
        # If we're entering a new interval with people
        if prev_count == 0 and current_count > 0:
            interval_start = time
        
        # If we're leaving an interval
        if prev_count > 0 and current_count == 0:
            if prev_count > max_count or (prev_count == max_count and interval_start and best_start and (time - interval_start) > (best_end - best_start)):
                max_count = prev_count
                best_start = interval_start
                best_end = time
        
        # If count increased to a new maximum within an interval
        if current_count > max_count and i + 1 < len(events):
            max_count = current_count
            best_start = time
            # Find when this interval ends (when count drops below max)
            for j in range(i + 1, len(events)):
                future_time, future_delta = events[j]
                temp_count = current_count
                for k in range(i + 1, j + 1):
                    temp_count += events[k][1]
                if temp_count < max_count:
                    best_end = events[j][0]
                    break
            else:
                best_end = events[-1][0]
    
    # Handle case where we're still in an interval at the end
    if current_count > 0 and not best_end:
        if current_count >= max_count:
            max_count = current_count
            best_start = interval_start
            best_end = events[-1][0]
    
    if best_start is None or best_end is None or max_count == 0:
        # Fallback: return the first availability slot
        first = availabilities[0]
        return {
            "start": first.start_time,
            "end": first.end_time,
            "count": 1
        }
    
    return {
        "start": best_start,
        "end": best_end,
        "count": max_count
    }
