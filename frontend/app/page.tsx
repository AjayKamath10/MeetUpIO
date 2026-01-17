'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CustomDateTimePicker } from '@/components/custom-date-time-picker';
import { createEvent } from '@/lib/api';
import type { EventCreate } from '@/types';

export default function HomePage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [windowStart, setWindowStart] = useState<Date | undefined>();
    const [windowEnd, setWindowEnd] = useState<Date | undefined>();

    const createEventMutation = useMutation({
        mutationFn: createEvent,
        onSuccess: (data) => {
            router.push(`/e/${data.slug}`);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!windowStart || !windowEnd) {
            alert('Please select start and end times');
            return;
        }

        // Format dates in local timezone (not UTC)
        const formatLocalDateTime = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        const eventData: EventCreate = {
            title,
            window_start: formatLocalDateTime(windowStart),
            window_end: formatLocalDateTime(windowEnd),
        };

        createEventMutation.mutate(eventData);
    };

    // Helper to set common date ranges
    const setThisWeekend = () => {
        const now = new Date();
        const saturday = new Date(now);
        saturday.setDate(now.getDate() + (6 - now.getDay()));
        saturday.setHours(9, 0, 0, 0); // Changed to 9am

        const sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);
        sunday.setHours(22, 0, 0, 0);

        setWindowStart(saturday);
        setWindowEnd(sunday);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
            <div className="container max-w-2xl mx-auto px-4 py-12 md:py-20">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <MapPin className="h-8 w-8 text-primary" />
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            MeetUp
                        </h1>
                    </div>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto">
                        Find the perfect time and spot for your group without the group chat chaos
                    </p>
                </div>

                {/* Create Event Form */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Create Your Event
                        </CardTitle>
                        <CardDescription>
                            Start by telling us what you're planning
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="title" className="text-sm font-medium block mb-2">
                                    What's the plan?
                                </label>
                                <Input
                                    id="title"
                                    type="text"
                                    placeholder="e.g., Friday Dinner, Weekend Brunch"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="w-full"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium block mb-2">
                                        From
                                    </label>
                                    <CustomDateTimePicker
                                        date={windowStart}
                                        setDate={setWindowStart}
                                        label="Start time"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium block mb-2">
                                        Until
                                    </label>
                                    <CustomDateTimePicker
                                        date={windowEnd}
                                        setDate={setWindowEnd}
                                        label="End time"
                                    />
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={setThisWeekend}
                                className="w-full md:w-auto"
                            >
                                <Calendar className="h-4 w-4 mr-2" />
                                This Weekend
                            </Button>

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={createEventMutation.isPending}
                            >
                                {createEventMutation.isPending ? 'Creating...' : 'Start Planning →'}
                            </Button>

                            {createEventMutation.isError && (
                                <p className="text-sm text-destructive">
                                    Failed to create event. Please try again.
                                </p>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Features */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="space-y-2">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold">Find Common Time</h3>
                        <p className="text-sm text-muted-foreground">
                            Automatic overlap detection
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold">Fair Location</h3>
                        <p className="text-sm text-muted-foreground">
                            Geographic midpoint calculation
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold">No Login Required</h3>
                        <p className="text-sm text-muted-foreground">
                            Just share the link
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
