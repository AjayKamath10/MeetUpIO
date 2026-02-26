import axios from 'axios';
import type {
    Event,
    EventCreate,
    EventDetail,
    ParticipantCreate,
    Participant,
    Results,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Event APIs
export const createEvent = async (data: EventCreate): Promise<Event> => {
    const response = await apiClient.post<Event>('/api/events/', data);
    return response.data;
};

export const getEvent = async (slug: string): Promise<EventDetail> => {
    const response = await apiClient.get<EventDetail>(`/api/events/${slug}`);
    return response.data;
};

// Participant APIs
export const joinEvent = async (
    slug: string,
    data: ParticipantCreate
): Promise<Participant> => {
    const response = await apiClient.post<Participant>(
        `/api/events/${slug}/join`,
        data
    );
    return response.data;
};

// Results APIs
export const getResults = async (slug: string): Promise<Results> => {
    const response = await apiClient.get<Results>(`/api/events/${slug}/results`);
    return response.data;
};

// Location search
export interface LocationResult {
    id: number;
    city: string;
    area_name: string;
    lat: number;
    lng: number;
}

export const searchLocations = async (
    q: string,
    city?: string
): Promise<LocationResult[]> => {
    const params: Record<string, string> = { q };
    if (city) params.city = city;
    const response = await apiClient.get<LocationResult[]>('/api/locations/search', { params });
    return response.data;
};

export default apiClient;
