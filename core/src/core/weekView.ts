import {SchedulerCell, SchedulerEvent, SchedulerOptions, SchedulerState, WeekViewComputed} from "../types";
import {getTimeSlots, getWeekDays, isSameDay} from "@livo/datetime";
import {computeNowIndicator} from "./nowIndicator";
import {groupEventsIntoCells} from "./events";

const DEFAULT_OPTIONS: Required<Pick<SchedulerOptions, "view" | "startHour" | "endHour">> =  {
    view: "week",
    startHour: 0,
    endHour: 24,
}

export function computeWeekView(
    rawOptions: SchedulerOptions,
    state: SchedulerState,
    events: SchedulerEvent[]
): WeekViewComputed {
    const options = { ...DEFAULT_OPTIONS, ...rawOptions };

    const days = getWeekDays(state.currentDate);
    const timeSlots = getTimeSlots(options.startHour, options.endHour);
    const cells: SchedulerCell[] = groupEventsIntoCells(days, timeSlots, events);

    const now = new Date();
    const todayIndex=  days.findIndex(day => isSameDay(day, now));

    const nowIndicator =
        todayIndex === -1
            ? null
            : computeNowIndicator({
                now,
                startHour: options.startHour,
                endHour: options.endHour,
                dayIndex: todayIndex,
            });

    return {
        days,
        timeSlots,
        cells,
        nowIndicator,
    };
}