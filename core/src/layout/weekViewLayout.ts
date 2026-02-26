import {INTERACTION_PHASES, SchedulerEvent, SchedulerState} from "../types";
import {DateAdapter, TIME_UNIT} from "../date";
import {LayoutResult, PositionedEvent, PositionedLine} from "./types";
import {getWeekDays, isSameDay} from "../core/dates";
import {computeNowIndicator} from "../core/nowIndicator";
import {WEEK_VIEW_OPTIONS} from "./weekViewOptions";

const MINUTES_PER_SLOT = 60;

export type WeekLayoutOptions = {
    startHour: number;
    endHour: number;
    slotHeightPx: number;
    columnWidthPx: number;
};

const DEFAULT_OPTIONS: WeekLayoutOptions = {
    slotHeightPx: 48,
    columnWidthPx: 120,
    startHour: 0,
    endHour: 24,
};

function buildWeekColumns(days: Date[], columnWidthPx: number): { key: string; date: Date; width: number }[] {
    return days.map((date, i) => ({
        key: `col-${i}`,
        date,
        width: columnWidthPx,
    }));
}

function buildWeekRows(opts: WeekLayoutOptions): { key: string; top: number; height: number }[] {
    const slotCount = opts.endHour - opts.startHour;
    return Array.from({ length: slotCount }, (_, i) => ({
        key: `row-${i}`,
        top: i * opts.slotHeightPx,
        height: opts.slotHeightPx,
    }));
}

interface PositionInGrid {
    top: number;
    height: number;
    left: number;
    width: number;
}

function positionEventInGrid(
    event: { start: Date; end: Date },
    days: Date[],
    opts: WeekLayoutOptions,
    adapter: DateAdapter,
): PositionInGrid | null {
    const dayStart = adapter.startOf(event.start, TIME_UNIT.DAY);
    const dayIndex = days.findIndex((d) => adapter.startOf(d, TIME_UNIT.DAY).getTime() === dayStart.getTime());

    if (dayIndex < 0) return null;

    const startHours = event.start.getHours() + event.start.getMinutes() / 60;
    const endHours = event.end.getHours() + event.end.getMinutes() / 60;

    if (endHours <= opts.startHour || startHours >= opts.endHour) return null;

    const clampedStart = Math.max(startHours, opts.startHour);
    const clampedEnd = Math.min(endHours, opts.endHour);

    const top = (clampedStart - opts.startHour) * opts.slotHeightPx;
    const height = Math.max(
        opts.slotHeightPx / 2,
        (clampedEnd - clampedStart) * opts.slotHeightPx
    );

    return {
        top,
        height,
        left: dayIndex * opts.columnWidthPx,
        width: opts.columnWidthPx,
    }
}

export interface TimeGridLayoutStrategy {
    compute(
        events: SchedulerEvent[],
        days: Date[],
        opts: WeekLayoutOptions,
        adapter: DateAdapter,
    ): PositionedEvent[];
}

const simpleStackingStrategy: TimeGridLayoutStrategy = {
    compute(events, days, opts, adapter) {
        const positioned: PositionedEvent[] = [];

        for (let z = 0; z < events.length; z++) {
            const event = events[z];
            const position = positionEventInGrid(event, days, opts, adapter);

            if (!position) continue;

            positioned.push({
                id: event.id,
                ...position,
                zIndex: z + 1,
            });
        }

        return positioned;
    },
};

function addDragPreviewIfNeeded(
    state: SchedulerState,
    days: Date[],
    opts: WeekLayoutOptions,
    adapter: DateAdapter,
    positionedEvents: PositionedEvent[],
) {
    if (state.interaction.phase !== INTERACTION_PHASES.DRAGGING) return;

    const { eventId, eventStart, eventEnd, dragStart, current } = state.interaction;

    const deltaMinutes = pointerDeltaToMinutes(
        dragStart,
        current,
        opts.slotHeightPx,
        MINUTES_PER_SLOT
    );

    const tentativeStart = new Date(eventStart.getTime() + deltaMinutes * 60_000);
    const tentativeEnd = new Date(eventEnd.getTime() + deltaMinutes * 60_000);

    const position = positionEventInGrid(
        { start: tentativeStart, end: tentativeEnd },
        days,
        opts,
        adapter,
    );

    if (!position) return;

    const base = positionedEvents.find((pe) => pe.id === eventId);

    positionedEvents.push({
        id: `${eventId}-preview`,
        ...position,
        zIndex: (base?.zIndex ?? 0) + 100,
        isPreview: true,
    });
}

function addSelectionRangeIfNeeded(
    state: SchedulerState,
    opts: WeekLayoutOptions,
): { selectionRange?: { start: Date; end: Date } } {
    if (state.interaction.phase !== INTERACTION_PHASES.SELECTING_RANGE) {
        return {};
    }

    const { anchorDate, dragStart, current } = state.interaction;

    const deltaMinutes = pointerDeltaToMinutes(
        dragStart,
        current,
        opts.slotHeightPx,
        MINUTES_PER_SLOT,
    );

    const start = new Date(anchorDate.getTime());
    const end = new Date(anchorDate.getTime() + deltaMinutes * 60_000);

    const rangeStart = start.getTime() <= end.getTime() ? start : end;
    const rangeEnd = start.getTime() <= end.getTime() ? end : start;

    return { selectionRange: { start: rangeStart, end: rangeEnd } };
}

function getNowIndicatorLine(
    days: Date[],
    opts: WeekLayoutOptions,
    adapter: DateAdapter,
): PositionedLine | undefined {
    const now = new Date();
    const todayIndex = days.findIndex((d) => isSameDay(d, now, adapter));

    if (todayIndex < 0) return undefined;

    const slotCount = opts.endHour - opts.startHour;

    const indicator = computeNowIndicator({
        now,
        startHour: opts.startHour,
        endHour: opts.endHour,
        dayIndex: todayIndex,
    });

    if (!indicator.visible) return undefined;

    return {
        top: (indicator.topPercent / 100) * (slotCount * opts.slotHeightPx),
        left: todayIndex * opts.columnWidthPx,
        width: opts.columnWidthPx,
    };
}

export function computeWeekLayout(
    state: SchedulerState,
    adapter: DateAdapter,
    options: Partial<WeekLayoutOptions> = {}
): LayoutResult {
    const opts = {
        ...DEFAULT_OPTIONS,
        ...options,
    };

    const { dateRange, events } = state;

    const weekStart = adapter.startOf(dateRange.start, TIME_UNIT.WEEK);
    const days = getWeekDays(weekStart, adapter);

    const columns = buildWeekColumns(days, opts.columnWidthPx);
    const rows = buildWeekRows(opts);

    const positionedEvents = simpleStackingStrategy.compute(
        events,
        days,
        opts,
        adapter,
    );

    addDragPreviewIfNeeded(state, days, opts, adapter, positionedEvents);

    const { selectionRange } = addSelectionRangeIfNeeded(state, opts);

    const nowIndicator = getNowIndicatorLine(days, opts, adapter);

    return {
        columns,
        rows,
        positionedEvents,
        nowIndicator,
        selectionRange,
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