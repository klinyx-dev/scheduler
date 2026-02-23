import {DateAdapter} from "../date";

/**
 * Get the days of the week for a given week start date.
 */
export function getWeekDays(weekStart: Date, adapter: DateAdapter): Date[] {
    return Array.from({ length: 7 }, (_, i) =>
        adapter.add(weekStart, { days: i }));
}

/**
 * Check if two dates are the same day.
 */
export function isSameDay(a: Date, b: Date, adapter: DateAdapter): boolean {
    return (
        adapter.startOf(a, "day").getTime() === adapter.startOf(b, "day").getTime()
    )
}