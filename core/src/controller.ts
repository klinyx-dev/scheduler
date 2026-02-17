import {SchedulerEvent, SchedulerOptions, SchedulerState, WeekViewComputed} from "./types";
import {computeWeekView} from "./core/weekView";
import {nextWeek, prevWeek, today} from "./core/navigation";

export interface SchedulerConfig {
    initialDate?: Date;
    options?: SchedulerOptions;
}

export interface SchedulerController {
    getState(): SchedulerState;
    setState(next: SchedulerState): void;

    setEvents(events: SchedulerEvent[]): void;

    getViewModel(): WeekViewComputed;

    goNext(): void;
    goPrevious(): void;
    goToday(): void;
}

export function createSchedulerController(config: SchedulerConfig = {}): SchedulerController {
    let state: SchedulerState = {
        currentDate: config.initialDate ?? new Date(),
    };
    let events: SchedulerEvent[] = [];
    let viewModel: WeekViewComputed = computeWeekView(config.options ?? {}, state, events);

    const options = config.options ?? {};

    function recompute() {
        viewModel = computeWeekView(options, state, events);
    }

    return {
        getState: () => state,

        setState(next) {
            state = next;
            recompute();
        },

        setEvents(next) {
            events = next;
            recompute();
        },

        getViewModel: () => viewModel,

        goNext() {
            state = nextWeek(state);
            recompute();
        },

        goPrevious() {
            state = prevWeek(state);
            recompute();
        },

        goToday() {
            state = today();
            recompute();
        },
    };
}