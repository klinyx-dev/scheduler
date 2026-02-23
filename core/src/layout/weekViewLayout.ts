import {INTERACTION_PHASES, SchedulerState} from "../types";
import {DateAdapter, TIME_UNIT} from "../date";
import {LayoutResult, PositionedEvent, PositionedLine} from "./types";
import {getWeekDays, isSameDay} from "../core/dates";
import {computeNowIndicator} from "../core/nowIndicator";

const MINUTES_PER_SLOT = 60;

const DEFAULT_OPTIONS = {
    slotHeightPx: 48,
    columnWidthPx: 120,
    startHour: 0,
    endHour: 24,
}

/**
 * Compute the layout for the week view.
 * 
 * @param state - The state of the scheduler.
 * @param adapter - The date adapter.
 * @param options - The options for the layout.
 * @returns The layout result.
 */
export function computeWeekLayout(
    state: SchedulerState,
    adapter: DateAdapter,
    options: {
        slotHeightPx: number;
        columnWidthPx: number;
        startHour: number;
        endHour: number;
    },
): LayoutResult {
    const opts = {
        ...DEFAULT_OPTIONS,
        ...options,
    };
    const { dateRange, events } = state;

    const weekStart = adapter.startOf(dateRange.start, TIME_UNIT.WEEK);
    const days = getWeekDays(weekStart, adapter);
    const slotCount = opts.endHour - opts.startHour;

    const columns = days.map((date, i) => ({
        key: `col-${i}`,
        date,
        width: opts.columnWidthPx
    }));

    const rows = Array.from({ length: slotCount }, (_, i) => ({
        key: `row-${i}`,
        top: i * opts.slotHeightPx,
        height: opts.slotHeightPx,
    }));

    const positionedEvents: PositionedEvent[] = [];

    for (let z = 0; z < events.length; z++) {
        const event = events[z];
        const dayStart = adapter.startOf(event.start, "day");
        const dayIndex = days.findIndex(
            (d) => adapter.startOf(d, "day").getTime() === dayStart.getTime()
        );

        if (dayIndex < 0) continue;

        const startHours = event.start.getHours() + event.start.getMinutes() / 60;
        const endHours = event.end.getHours() + event.end.getMinutes() / 60;

        if (endHours <= opts.startHour || startHours >= opts.endHour) continue;

        const clampedStart = Math.max(startHours, opts.startHour);
        const clampedEnd = Math.min(endHours, opts.endHour);

        const top = (clampedStart - opts.startHour) * opts.slotHeightPx;
        const height = Math.max(
            opts.slotHeightPx / 2,
            (clampedEnd - clampedStart) * opts.slotHeightPx
        );

        positionedEvents.push({
            id: event.id,
            top,
            height,
            left: dayIndex * opts.columnWidthPx,
            width: opts.columnWidthPx,
            zIndex: z + 1,
        });
    }

    if (state.interaction.phase === INTERACTION_PHASES.DRAGGING) {
        const { eventId, eventStart, eventEnd, dragStart, current } = state.interaction;

        const deltaMinutes = pointerDeltaToMinutes(dragStart, current, opts.slotHeightPx, MINUTES_PER_SLOT);

        const tentativeStart = new Date(eventStart.getTime() + deltaMinutes * 60_000);
        const tentativeEnd = new Date(eventEnd.getTime() + deltaMinutes * 60_000);

        const dayStart = adapter.startOf(tentativeStart, TIME_UNIT.DAY);
        const dayIndex = days.findIndex(
            (d) => adapter.startOf(d, TIME_UNIT.DAY).getTime() === dayStart.getTime(),
        );

        if (dayIndex >= 0) {
            const startHours = tentativeStart.getHours() + tentativeStart.getMinutes() / 60;
            const endHours = tentativeEnd.getHours() + tentativeEnd.getMinutes() / 60;

            if (endHours > opts.startHour && startHours < opts.endHour) {
                const clampedStart = Math.max(startHours, opts.startHour);
                const clampedEnd = Math.min(endHours, opts.endHour);

                const top = (clampedStart - opts.startHour) * opts.slotHeightPx;
                const height = Math.max(
                    opts.slotHeightPx / 2,
                    (clampedEnd - clampedStart) * opts.slotHeightPx
                );

                const base = positionedEvents.find(pe => pe.id === eventId);

                // for now, just duplicate the real event as a preview (no time shift yet)
                positionedEvents.push({
                    id: `${eventId}-preview`,
                    top,
                    height,
                    left: dayIndex * opts.columnWidthPx,
                    width: base?.width ?? opts.columnWidthPx,
                    zIndex: (base?.zIndex ?? 0) + 100,
                });
            }
        }
    }

    const now = new Date();
    const todayIndex = days.findIndex((d) => isSameDay(d, now, adapter));

    let nowIndicator: PositionedLine | undefined;

    if (todayIndex >= 0) {
        const indicator = computeNowIndicator({
            now,
            startHour: opts.startHour,
            endHour: opts.endHour,
            dayIndex: todayIndex,
        });

        if (indicator.visible) {
            nowIndicator = {
                top: (indicator.topPercent / 100) * (slotCount * opts.slotHeightPx),
                left: todayIndex * opts.columnWidthPx,
                width: opts.columnWidthPx,
            };
        }
    }

    return {
        columns,
        rows,
        positionedEvents,
        nowIndicator
    };
}

/**
 * Compute the delta in minutes between the drag start and the current position.
 * 
 * @param dragStart - The drag start position.
 * @param current - The current position.
 * @param slotHeightPx - The height of a slot in pixels.
 * @param minutesPerSlot - The number of minutes per slot.
 * @returns The delta in minutes.
 */
export function pointerDeltaToMinutes(
    dragStart: { y: number },
    current: { y: number },
    slotHeightPx: number,
    minutesPerSlot: number
): number {
    const deltaY = current.y - dragStart.y;
    const slotsMoved = deltaY / slotHeightPx;
    return slotsMoved * minutesPerSlot;
}