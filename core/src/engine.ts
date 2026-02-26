import type { DateAdapter } from "./date/types";
import type { LayoutResult } from "./layout/types";
import type { SchedulerView, ViewType } from "./view/types";
import type { DateRange, Resource, SchedulerEvent } from "./model/types";
import type { SchedulerAction, SchedulerState } from "./interaction/types";
import type { SchedulerConfig } from "./config/types";
import { nativeDateAdapter } from "./date";
import { todayRange } from "./core/navigation";
import { VIEW_TYPES } from "./view/types";
import { createStateStore } from "./engine/stateStore";
import { createEngineViews } from "./engine/views";
import { createEngineInteractions } from "./engine/interactions";

export interface Engine {
    setEvents(events: SchedulerEvent[]): void;
    setResources(resources: Resource[] | undefined): void;
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

/** Builds the scheduler engine and wires state, views, and interactions. */
export function createEngine(config: SchedulerConfig): Engine {
    const adapter: DateAdapter = config.dateAdapter ?? nativeDateAdapter;
    const initialRange = todayRange(adapter);

    const initialState: SchedulerState = {
        activeView: config.initialView ?? VIEW_TYPES.WEEK,
        constraints: config.constraints,
        dateRange: initialRange,
        events: [],
        interaction: { phase: "idle" },
        resources: undefined,
    };

    const store = createStateStore(initialState);
    const views = createEngineViews(adapter);
    const configRef = { current: config };
    const interactions = createEngineInteractions(store, adapter, configRef);

    return {
        setEvents: interactions.setEvents,
        setResources: interactions.setResources,
        setView: interactions.setView,
        setDateRange: interactions.setDateRange,
        updateConfig: interactions.updateConfig,
        registerView: views.registerView,
        getAvailableViews: views.getAvailableViews,
        dispatch: interactions.dispatch,
        getState: store.getState,
        getLayout: () => views.getLayout(store.getState()),
        subscribe: store.subscribe,
        destroy: store.destroy,
    };
}
