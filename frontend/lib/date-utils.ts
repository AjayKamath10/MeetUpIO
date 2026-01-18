import { parseISO } from 'date-fns';

/**
 * Parses a date string as UTC.
 * If the string is naive (no timezone), 'Z' is appended to force UTC interpretation.
 * This ensures that server-sent UTC times are correctly converted to the user's local time.
 */
export const parseAsUTC = (dateStr: string) => {
    if (!dateStr) return new Date();
    // Check if it already has timezone info (Z or +HH:mm or -HH:mm)
    const hasTimezone = dateStr.endsWith('Z') || /[+-]\d{2}(:?\d{2})?$/.test(dateStr);
    const normalized = hasTimezone ? dateStr : `${dateStr}Z`;
    return parseISO(normalized);
};
