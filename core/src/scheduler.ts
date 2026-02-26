import {
    DateRange, INTERACTION_PHASES,
    Resource,
    SchedulerAction,
    SchedulerConfig,
    SchedulerEvent,
    SchedulerState,
    SchedulerView, VIEW_TYPES, ViewType
} from "./types";
import {LayoutResult} from "./layout/types";
import {nativeDateAdapter} from "./date";
import {todayRange} from "./core/navigation";
import {INTERNAL_ACTIONS, InternalAction} from "./reducer/actions";
import {reducer} from "./reducer/reducer";
import {computeWeekLayout} from "./layout/weekViewLayout";
import {applyConstraints} from "./constraints/applyConstraints";
import {WEEK_VIEW_OPTIONS} from "./layout/weekViewOptions";
import {commitDragIfAny, commitResizeIfAny} from "./interaction/commit";

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

export function createScheduler(config: SchedulerConfig): Scheduler {
    const configRef = { current: config };

    const adapter = config.dateAdapter ?? nativeDateAdapter;
    const initialRange = todayRange(adapter);

    let state: SchedulerState = {
        activeView: config.initialView ?? VIEW_TYPES.WEEK,
        constraints: config.constraints,
        dateRange: initialRange,
        events: [],
        interaction: { phase: INTERACTION_PHASES.IDLE },
        resources: undefined
    };

    const views = new Map<string, SchedulerView>();
    const listeners: Array<() => void> = [];

    // Dispatch an internal action to the reducer.
    function dispatchInternal(action: InternalAction) {
        state = reducer(state, action);
        listeners.forEach(listener => listener());
    }

    // Get the layout for the current view.
    function getLayout(): LayoutResult {
        const view = views.get(state.activeView);

        if (!view) {
            return {
                columns: [],
                rows: [],
                positionedEvents: [],
            };
        }

        if (state.activeView === VIEW_TYPES.WEEK) {
            return computeWeekLayout(state, adapter, WEEK_VIEW_OPTIONS);
        }

        return view.computeLayout(state);
    }

    const weekView: SchedulerView = {
        type: VIEW_TYPES.WEEK,
        computeLayout(state: SchedulerState): LayoutResult {
            return computeWeekLayout(state, adapter, WEEK_VIEW_OPTIONS);
        },
    };
    views.set(VIEW_TYPES.WEEK, weekView);

    return {
        setEvents(events) {
            const constrained = applyConstraints(
                events,
                state.constraints,
                adapter
            );
            dispatchInternal({type: INTERNAL_ACTIONS.SET_EVENTS, payload: constrained});
        },
        setResources(resources) {
            dispatchInternal({type: INTERNAL_ACTIONS.SET_RESOURCES, payload: resources});
        },
        setView(viewType) {
            dispatchInternal({type: INTERNAL_ACTIONS.SET_VIEW, payload: viewType});
        },
        setDateRange(range) {
            dispatchInternal({type: INTERNAL_ACTIONS.SET_DATE_RANGE, payload: range});
        },
        updateConfig(partial) {
            dispatchInternal({type: INTERNAL_ACTIONS.UPDATE_CONFIG, payload: partial});
        },
        registerView(view) {
            views.set(view.type, view);
        },
        getAvailableViews() {
            return Array.from(views.keys());
        },
        dispatch(action) {
            switch (action.type) {
                case "POINTER_DOWN":
                    dispatchInternal({type: "POINTER_DOWN", payload: action.payload});
                    break;
                case "POINTER_MOVE":
                    dispatchInternal({type: "POINTER_MOVE", payload: action.payload});
                    break;
                case "POINTER_UP":
                    commitResizeIfAny(state, configRef, adapter, dispatchInternal);
                    commitDragIfAny(state, configRef, adapter, dispatchInternal);
                    dispatchInternal({type: "POINTER_UP"});
                    break;
                case "CANCEL_INTERACTION":
                    dispatchInternal({type: "CANCEL_INTERACTION"});
                    break;
            }
        },
        getState: () => state,
        getLayout,
        subscribe(listener) {
            listeners.push(listener);
            return () => {
                const i = listeners.indexOf(listener);
                if (i !== -1) listeners.splice(i, 1);
            };
        },
        destroy() {
            listeners.length = 0;
        },
    };
}