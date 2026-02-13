import {SchedulerState} from "../types";
import {addDays} from "@livo/datetime";

export function nextWeek(state: SchedulerState): SchedulerState {
    return { ...state, currentDate: addDays(state.currentDate, 7) };
}

export function prevWeek(state: SchedulerState) {
    return { ...state, currentDate: addDays(state.currentDate, -7) };
}

export function today(): SchedulerState {
    return { currentDate: new Date() };
}