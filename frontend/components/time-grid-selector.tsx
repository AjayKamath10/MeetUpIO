'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, parseISO, addHours, isBefore } from 'date-fns';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Availability } from '@/types';

interface TimeGridSelectorProps {
    windowStart: string;
    windowEnd: string;
    onSelectionChange: (availabilities: Availability[]) => void;
}

export function TimeGridSelector({
    windowStart,
    windowEnd,
    onSelectionChange,
}: TimeGridSelectorProps) {
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

    // Generate hourly time slots
    const timeSlots = useMemo(() => {
        const slots: string[] = [];
        let current = parseISO(windowStart);
        const end = parseISO(windowEnd);

        while (isBefore(current, end)) {
            slots.push(current.toISOString());
            current = addHours(current, 1);
        }

        return slots;
    }, [windowStart, windowEnd]);

    // Toggle slot selection
    const toggleSlot = (slot: string) => {
        setSelectedSlots((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(slot)) {
                newSet.delete(slot);
            } else {
                newSet.add(slot);
            }
            return newSet;
        });
    };

    // Convert selected slots to availability ranges
    useEffect(() => {
        if (selectedSlots.size === 0) {
            onSelectionChange([]);
            return;
        }

        // Sort selected slots
        const sorted = Array.from(selectedSlots).sort();
        const ranges: Availability[] = [];

        let rangeStart = sorted[0];
        let previousSlot = sorted[0];

        for (let i = 1; i < sorted.length; i++) {
            const currentSlot = sorted[i];
            const expectedNext = addHours(parseISO(previousSlot), 1).toISOString();

            // If not contiguous, close current range and start new one
            if (currentSlot !== expectedNext) {
                ranges.push({
                    start_time: rangeStart,
                    end_time: addHours(parseISO(previousSlot), 1).toISOString(),
                });
                rangeStart = currentSlot;
            }

            previousSlot = currentSlot;
        }

        // Close final range
        ranges.push({
            start_time: rangeStart,
            end_time: addHours(parseISO(previousSlot), 1).toISOString(),
        });

        onSelectionChange(ranges);
    }, [selectedSlots, onSelectionChange]);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Tap hours you're available</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto pr-2">
                {timeSlots.map((slot) => {
                    const isSelected = selectedSlots.has(slot);
                    const time = parseISO(slot);

                    return (
                        <button
                            key={slot}
                            type="button"
                            onClick={() => toggleSlot(slot)}
                            className={cn(
                                'time-slot flex flex-col items-center justify-center p-3 font-medium transition-all active:scale-95',
                                isSelected ? 'time-slot-selected' : 'time-slot-unselected'
                            )}
                        >
                            <span className="text-xs opacity-70 mb-1">
                                {format(time, 'EEE, MMM d')}
                            </span>
                            <span className="text-lg">
                                {format(time, 'h:mm')}
                            </span>
                            <span className="text-xs opacity-80">
                                {format(time, 'a')}
                            </span>
                        </button>
                    );
                })}
            </div>

            {selectedSlots.size > 0 && (
                <div className="text-sm text-muted-foreground">
                    {selectedSlots.size} hour{selectedSlots.size !== 1 ? 's' : ''} selected
                </div>
            )}
        </div>
    );
}
