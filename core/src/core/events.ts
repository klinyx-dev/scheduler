import {SchedulerCell, SchedulerEvent} from "../types";
import {isSameDay} from "@livo/datetime";

export function groupEventsIntoCells(days: Date[], timeSlots: number[], events: SchedulerEvent[]): SchedulerCell[] {
    const cells: SchedulerCell[] = [];

    for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
        const day = days[dayIndex];

        for (const hour of timeSlots) {
            const cellEvents = events.filter(event => {
                return (
                    isSameDay(event.start, day) &&
                    event.start.getHours() <= hour &&
                    event.end.getHours() > hour
                );
            });

            cells.push({
                dayIndex,
                hour,
                date: day,
                events: cellEvents });
        }
    }

    return cells;
}