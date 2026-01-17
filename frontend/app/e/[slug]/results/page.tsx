'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { parseAsUTC } from '@/lib/date-utils';
import {
    Clock,
    MapPin,
    Users,
    Share2,
    ArrowLeft,
    Utensils,
    DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getResults, getEvent } from '@/lib/api';

export default function ResultsPage({ params }: { params: { slug: string } }) {
    const router = useRouter();

    const { data: results, isLoading: resultsLoading } = useQuery({
        queryKey: ['results', params.slug],
        queryFn: () => getResults(params.slug),
    });

    const { data: event } = useQuery({
        queryKey: ['event', params.slug],
        queryFn: () => getEvent(params.slug),
    });

    const handleShare = async () => {
        const url = window.location.origin + `/e/${params.slug}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: results?.event_title || 'Join our event',
                    text: 'Join this event on MeetUp!',
                    url,
                });
            } catch (err) {
                // User cancelled share
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        }
    };

    if (resultsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Calculating results...</p>
                </div>
            </div>
        );
    }

    if (!results) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>No Results Yet</CardTitle>
                        <CardDescription>
                            We need at least one participant to calculate results.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push(`/e/${params.slug}`)}>
                            Back to Event
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
            <div className="container max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => router.push(`/e/${params.slug}`)}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button variant="outline" onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        {results.event_title}
                    </h1>
                    <p className="text-muted-foreground">
                        Here's the perfect plan for your group
                    </p>
                </div>

                {/* Golden Window - Suggested Time */}
                {results.suggested_time && (
                    <Card className="mb-6 bg-gradient-to-br from-primary/10 to-blue-500/10 border-primary/20 shadow-lg">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/20 rounded-full">
                                    <Clock className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>Perfect Time</CardTitle>
                                    <CardDescription>
                                        When everyone can make it
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-4">
                                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                                    {format(parseAsUTC(results.suggested_time.start), 'h:mm a')}
                                    {' - '}
                                    {format(parseAsUTC(results.suggested_time.end), 'h:mm a')}
                                </div>
                                <div className="text-lg text-muted-foreground">
                                    {format(parseAsUTC(results.suggested_time.start), 'EEEE, MMMM d, yyyy')}
                                </div>
                                <Badge variant="secondary" className="mt-4">
                                    <Users className="h-3 w-3 mr-1" />
                                    {results.suggested_time.participant_count} people available
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Suggested Location */}
                {results.suggested_location && (
                    <Card className="mb-6 shadow-lg">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-green-500/20 rounded-full">
                                    <MapPin className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <CardTitle>Fair Meeting Point</CardTitle>
                                    <CardDescription>
                                        Geographic center for everyone
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-4">
                                <div className="text-3xl font-bold mb-2">
                                    {results.suggested_location.neighborhood}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {results.suggested_location.lat.toFixed(4)}°N,{' '}
                                    {results.suggested_location.lng.toFixed(4)}°E
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Venue Recommendations */}
                {results.venue_recommendations.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Utensils className="h-6 w-6" />
                            Recommended Venues
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {results.venue_recommendations.map((venue, index) => (
                                <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{venue.name}</CardTitle>
                                        <CardDescription>{venue.type}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            {venue.description}
                                        </p>
                                        <div className="flex items-center gap-1 text-sm">
                                            <DollarSign className="h-4 w-4" />
                                            <span>{venue.estimated_price}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Participants Summary */}
                {event && event.participants.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Who's Coming ({event.participants.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {event.participants.map((participant) => (
                                    <div
                                        key={participant.id}
                                        className="flex items-center gap-2 p-3 bg-muted rounded-md"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                                            {participant.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">
                                                {participant.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                {participant.location_name}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Call to Action */}
                <div className="mt-8 text-center">
                    <Button size="lg" onClick={handleShare} className="shadow-lg">
                        <Share2 className="mr-2 h-4 w-4" />
                        Invite More People
                    </Button>
                </div>
            </div>
        </div>
    );
}
