// Event types
export interface Event {
    id: string;
    slug: string;
    title: string;
    window_start: string;
    window_end: string;
    status: string;
    created_at: string;
}

export interface EventCreate {
    title: string;
    window_start: string;
    window_end: string;
}

export interface EventDetail extends Event {
    participants: ParticipantBasic[];
}

// Participant types
export interface ParticipantBasic {
    id: string;
    name: string;
    location_name: string;
    is_host: boolean;
}

export interface Participant extends ParticipantBasic {
    event_id: string;
    lat?: number;
    lng?: number;
}

export interface Availability {
    start_time: string;
    end_time: string;
}

export interface ParticipantCreate {
    name: string;
    location_name: string;
    is_host?: boolean;
    availabilities: Availability[];
}

// Results types
export interface SuggestedTime {
    start: string;
    end: string;
    participant_count: number;
}

export interface SuggestedLocation {
    lat: number;
    lng: number;
    neighborhood: string;
}

export interface VenueRecommendation {
    name: string;
    type: string;
    description: string;
    estimated_price: string;
    address?: string;
    rating?: number;
    maps_url?: string;
}

export interface Results {
    event_title: string;
    suggested_time: SuggestedTime | null;
    suggested_location: SuggestedLocation | null;
    venue_recommendations: VenueRecommendation[];
    total_participants: number;
}
