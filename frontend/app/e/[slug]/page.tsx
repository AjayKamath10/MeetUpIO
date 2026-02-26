'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { parseAsUTC } from '@/lib/date-utils';
import { Calendar, MapPin, Users, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TimeGridSelector } from '@/components/time-grid-selector';
import { LocationCombobox } from '@/components/location-combobox';
import { getEvent, joinEvent } from '@/lib/api';
import type { Availability, ParticipantCreate } from '@/types';

export default function EventPage({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [availabilities, setAvailabilities] = useState<Availability[]>([]);
    const [hasJoined, setHasJoined] = useState(false);
    const [showTimeSlotError, setShowTimeSlotError] = useState(false);

    const { data: event, isLoading } = useQuery({
        queryKey: ['event', params.slug],
        queryFn: () => getEvent(params.slug),
    });

    const joinMutation = useMutation({
        mutationFn: (data: ParticipantCreate) => joinEvent(params.slug, data),
        onSuccess: (data) => {
            // Save participant ID to localStorage
            localStorage.setItem(`participant_${params.slug}`, data.id!);
            setHasJoined(true);
        },
    });

    // Check if user has already joined
    useEffect(() => {
        const participantId = localStorage.getItem(`participant_${params.slug}`);
        if (participantId) {
            setHasJoined(true);
        }
    }, [params.slug]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (availabilities.length === 0) {
            setShowTimeSlotError(true);
            return;
        }

        const participantData: ParticipantCreate = {
            name,
            location_name: location,
            is_host: false,
            availabilities,
        };

        joinMutation.mutate(participantData);
    };

    // Clear error when user selects time slots
    useEffect(() => {
        if (availabilities.length > 0) {
            setShowTimeSlotError(false);
        }
    }, [availabilities]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading event...</p>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>Event Not Found</CardTitle>
                        <CardDescription>
                            The event you're looking for doesn't exist.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (hasJoined) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950">
                <div className="container max-w-2xl mx-auto px-4 py-12">
                    <Card className="text-center shadow-lg">
                        <CardContent className="pt-8 pb-8">
                            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">You're In!</h2>
                            <p className="text-muted-foreground mb-6">
                                Thanks for submitting your availability for {event.title}
                            </p>
                            <Button
                                onClick={() => router.push(`/e/${params.slug}/results`)}
                                size="lg"
                            >
                                View Results
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
            <div className="container max-w-3xl mx-auto px-4 py-8">
                {/* Event Header */}
                <Card className="mb-6 shadow-lg">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <CardTitle className="text-2xl mb-2">{event.title}</CardTitle>
                                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {format(parseAsUTC(event.window_start), 'MMM d')} -{' '}
                                        {format(parseAsUTC(event.window_end), 'MMM d, yyyy')}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        {event.participants.length} participant{event.participants.length !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>
                            <Badge variant="secondary">{event.status}</Badge>
                        </div>
                    </CardHeader>
                </Card>

                {/* Guest Form */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Join the Event</CardTitle>
                        <CardDescription>
                            Tell us when you're available and where you're coming from
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="text-sm font-medium block mb-2">
                                        Your Name
                                    </label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="location" className="text-sm font-medium block mb-2">
                                        Your Location
                                    </label>
                                    <LocationCombobox
                                        value={location}
                                        onChange={setLocation}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium block mb-3">
                                    When are you available?
                                </label>
                                <TimeGridSelector
                                    windowStart={event.window_start}
                                    windowEnd={event.window_end}
                                    onSelectionChange={setAvailabilities}
                                />

                                {/* Modern error message */}
                                {showTimeSlotError && (
                                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-2 animate-in slide-in-from-top-2 duration-300">
                                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                                Please select at least one time slot
                                            </p>
                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                Click on the time slots above to mark your availability
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={joinMutation.isPending}
                            >
                                {joinMutation.isPending ? 'Submitting...' : "I'm In!"}
                            </Button>

                            {joinMutation.isError && (
                                <p className="text-sm text-destructive text-center">
                                    Failed to join event. Please try again.
                                </p>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Participants List */}
                {event.participants.length > 0 && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Who's Coming</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {event.participants.map((participant) => (
                                    <Badge
                                        key={participant.id}
                                        variant="secondary"
                                        className="flex items-center gap-1"
                                    >
                                        {participant.name}
                                        {participant.is_host && (
                                            <span className="text-xs">(Host)</span>
                                        )}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
