import {DateAdapter, TIME_UNIT} from "../date/types";
import {DateRange} from "../model/types";

export function nextWeekRange(range: DateRange, adapter: DateAdapter): DateRange {
    return {
        start: adapter.add(range.start, { weeks: 1 }),
        end: adapter.add(range.end, { weeks: 1 }),
    }
}

export function previousWeekRange(range: DateRange, adapter: DateAdapter) {
    return {
        start: adapter.add(range.start, { weeks: -1 }),
        end: adapter.add(range.end, { weeks: -1 }),
    }
}

export function todayRange(adapter: DateAdapter) {
    const now = new Date();
    const start = adapter.startOf(now, TIME_UNIT.WEEK);
    const end = adapter.add(start, { weeks: 1 });
    return { start, end };
}