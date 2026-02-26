'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2, ChevronDown } from 'lucide-react';
import { searchLocations, LocationResult } from '@/lib/api';

interface LocationComboboxProps {
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
}

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

export function LocationCombobox({ value, onChange, required }: LocationComboboxProps) {
    const [inputValue, setInputValue] = useState(value);
    const [results, setResults] = useState<LocationResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const debouncedQuery = useDebounce(inputValue, 300);

    // Fetch results when debounced query changes
    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        let cancelled = false;
        setIsLoading(true);

        searchLocations(debouncedQuery)
            .then((data) => {
                if (!cancelled) {
                    setResults(data);
                    setIsOpen(data.length > 0);
                    setActiveIndex(-1);
                }
            })
            .catch(() => {
                if (!cancelled) setResults([]);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => { cancelled = true; };
    }, [debouncedQuery]);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const selectLocation = useCallback((loc: LocationResult) => {
        setInputValue(loc.area_name);
        onChange(loc.area_name);
        setIsOpen(false);
        setResults([]);
    }, [onChange]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            selectLocation(results[activeIndex]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    // Scroll active item into view
    useEffect(() => {
        if (activeIndex >= 0 && listRef.current) {
            const items = listRef.current.querySelectorAll('li');
            items[activeIndex]?.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIndex]);

    return (
        <div ref={containerRef} className="relative">
            {/* Input */}
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                    ref={inputRef}
                    id="location"
                    type="text"
                    autoComplete="off"
                    required={required}
                    value={inputValue}
                    placeholder="e.g., Koramangala, Bandra..."
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        // Clear confirmed selection if user edits
                        onChange('');
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (results.length > 0) setIsOpen(true);
                    }}
                    aria-autocomplete="list"
                    aria-controls="location-listbox"
                    aria-expanded={isOpen}
                    aria-activedescendant={activeIndex >= 0 ? `location-option-${activeIndex}` : undefined}
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {isLoading
                        ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    }
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && results.length > 0 && (
                <ul
                    ref={listRef}
                    id="location-listbox"
                    role="listbox"
                    className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border border-border bg-popover shadow-lg py-1 text-sm"
                >
                    {results.map((loc, idx) => (
                        <li
                            key={loc.id}
                            id={`location-option-${idx}`}
                            role="option"
                            aria-selected={idx === activeIndex}
                            onMouseDown={(e) => { e.preventDefault(); selectLocation(loc); }}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={`flex items-start gap-2 px-3 py-2 cursor-pointer transition-colors ${idx === activeIndex
                                    ? 'bg-accent text-accent-foreground'
                                    : 'hover:bg-accent hover:text-accent-foreground'
                                }`}
                        >
                            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                            <div>
                                <span className="font-medium">{loc.area_name}</span>
                                <span className="ml-1.5 text-xs text-muted-foreground">{loc.city}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* No results hint */}
            {isOpen && !isLoading && results.length === 0 && debouncedQuery.length >= 2 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg px-3 py-3 text-sm text-muted-foreground">
                    No areas found for &ldquo;{debouncedQuery}&rdquo;
                </div>
            )}
        </div>
    );
}
