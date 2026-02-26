import type {
    DateRange,
    Resource,
    SchedulerAction,
    SchedulerConfig,
    SchedulerEvent,
} from "./types";
import type { LayoutResult } from "./layout/types";
import type { SchedulerState } from "./interaction/types";
import type { SchedulerView, ViewType } from "./view/types";
import { createEngine } from "./engine";

export interface Scheduler {
    setEvents(events: SchedulerEvent[]): void;
    setResources?(resources: Resource[]): void;
    setView(viewType: ViewType): void;
    setDateRange(range: DateRange): void;
    updateConfig(partial: Partial<SchedulerConfig>): void;

    registerView(view: SchedulerView): void;
    getAvailableViews(): string[];

    dispatch(action: SchedulerAction): void;

    getState(): SchedulerState;
    getLayout(): LayoutResult;

    subscribe(listener: () => void): () => void;
    destroy(): void;
}

/**
 * The main entry point for the scheduler.
 * 
 * @param config - The configuration for the scheduler.
 * @returns A new scheduler instance.
 */
export function createScheduler(config: SchedulerConfig): Scheduler {
    const engine = createEngine(config);

    return {
        setEvents(events) {
            engine.setEvents(events);
        },
        setResources(resources) {
            engine.setResources?.(resources);
        },
        setView(viewType) {
            engine.setView(viewType);
        },
        setDateRange(range) {
            engine.setDateRange(range);
        },
        updateConfig(partial) {
            engine.updateConfig(partial);
        },
        registerView(view) {
            engine.registerView(view);
        },
        getAvailableViews() {
            return engine.getAvailableViews();
        },
        dispatch(action) {
            engine.dispatch(action);
        },
        getState: () => engine.getState(),
        getLayout: () => engine.getLayout(),
        subscribe(listener) {
            return engine.subscribe(listener);
        },
        destroy() {
            engine.destroy();
        },
    };
}