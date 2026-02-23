import {SchedulerConstraints, SchedulerEvent, TimeRange} from "../types";
import {DateAdapter, Duration, TIME_UNIT} from "../date";
import {isSameDay} from "../core/dates";

/**
 * Apply constraints to a list of events.
 */
export function applyConstraints(
    events: SchedulerEvent[],
    constraints: SchedulerConstraints | undefined,
    adapter: DateAdapter
): SchedulerEvent[] {
    if (!constraints) return events;

    const filtered: SchedulerEvent[] = [];

    for (const ev of events) {
        const durationMinutes = adapter.diff(ev.start, ev.end, TIME_UNIT.MINUTE);

        if (constraints.minDuration && durationMinutes < durationToMinutes(constraints.minDuration, adapter)) continue;
        if (constraints.maxDuration && durationMinutes > durationToMinutes(constraints.maxDuration, adapter)) continue;
        if (constraints.businessHours && !withinBusinessHours(ev, constraints.businessHours, adapter)) continue;

        // Check overlap only on the set we’ve already accepted.
        if (constraints.allowOverlap === false && violatesNoOverlap([...filtered, ev])) continue;

        filtered.push(ev);
    }

    return filtered;
}

/**
 * Convert a Duration into minutes using the DateAdapter,
 * so years/months/weeks obey whatever calendar rules the adapter encodes.
 */
function durationToMinutes(duration: Duration, adapter: DateAdapter) {
    // Use a fixed reference point so DST / offset rules come from the adapter.
    const base = new Date(0);
    const end = adapter.add(base, duration);

    // Use absolute value in case someone passes a negative duration.
    return Math.abs(adapter.diff(base, end, TIME_UNIT.MINUTE));
}

/**
 * Return true if the event lies entirely within at least one of the given
 * business-hour ranges for its start day.
 *
 * Assumptions (robust but simple):
 * - TimeRange.start / end are minutes from midnight (0–1440).
 * - Events that cross midnight are treated as "not within" business hours
 */
function withinBusinessHours(event: SchedulerEvent, ranges: TimeRange[], adapter: DateAdapter): boolean {
    if (!ranges.length) return true;

    // FIXME: strict for now: event must be within a single day
    const sameDay = isSameDay(event.start, event.end, adapter);
    if (!sameDay) return false;

    const startMinutes = event.start.getHours() * 60 + event.start.getMinutes();
    const endMinutes = event.end.getHours() * 60 + event.end.getMinutes();

    // Guard against inverted events
    // Normalize so start <- end
    const s = Math.min(startMinutes, endMinutes);
    const e = Math.max(startMinutes, endMinutes);

    return ranges.some((r) => {
        // Normalize bad ranges defensively.
        const rs = Math.min(r.start, r.end);
        const re = Math.max(r.start, r.end);
        return s >= rs && e <= re;
    });
}

/**
 * Check if two events overlap.
 * If the events have the same start and end time, they are considered to overlap.
 * 
 * @param a - The first event.
 * @param b - The second event.
 * @returns True if the events overlap, false otherwise.
 */
function eventsOverlap(a: SchedulerEvent, b: SchedulerEvent): boolean {
    const startA = a.start.getTime();
    const endA = a.end.getTime();

    const startB = b.start.getTime();
    const endB = b.end.getTime();

    return startA < endB && startB < endA;
}

/**
 * Check if any two events in the list overlap.
 * 
 * @param events - The events to check.
 * @returns True if the events violate the no overlap constraint, false otherwise.
 */
function violatesNoOverlap(events: SchedulerEvent[]): boolean {
    // O(n^2) is fine for v1; optimize later
    for (let i = 0; i < events.length; i++) {
        for (let j = i + 1; j < events.length; j++) {
            if (eventsOverlap(events[i], events[j])) return true;
        }
    }
    return false;
}