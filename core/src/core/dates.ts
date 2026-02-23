import {DateAdapter} from "../date";

export function getWeekDays(weekStart: Date, adapter: DateAdapter): Date[] {
    return Array.from({ length: 7 }, (_, i) =>
        adapter.add(weekStart, { days: i }));
}

export function isSameDay(a: Date, b: Date, adapter: DateAdapter): boolean {
    return (
        adapter.startOf(a, "day").getTime() === adapter.startOf(b, "day").getTime()
    )
}