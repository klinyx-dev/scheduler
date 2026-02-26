import type {DateAdapter} from "../date/types";
import type {LayoutResult} from "../layout/types";
import type {SchedulerView, ViewType} from "../view/types";
import {VIEW_TYPES} from "../view/types";
import type {SchedulerState} from "../interaction/types";
import {computeWeekLayout} from "../layout/weekViewLayout";
import {WEEK_VIEW_OPTIONS} from "../layout/weekViewOptions";
import {createViewRegistry} from "../view/registry";

export interface EngineViews {
    registerView(view: SchedulerView): void;
    getAvailableViews(): ViewType[];
    getLayout(state: SchedulerState): LayoutResult;
}

/** Builds the view registry and layout computation (includes the built-in week view). */
export function createEngineViews(adapter: DateAdapter): EngineViews {
    const registry = createViewRegistry(() => ({
        columns: [],
        rows: [],
        positionedEvents: [],
    }));

    const weekView: SchedulerView = {
        type: VIEW_TYPES.WEEK,
        computeLayout(engineState: SchedulerState): LayoutResult {
            return computeWeekLayout(engineState, adapter, WEEK_VIEW_OPTIONS);
        },
    };
    registry.register(weekView);

    return {
        registerView(view) {
            registry.register(view);
        },
        getAvailableViews() {
            return registry.list();
        },
        getLayout(state) {
            return registry.computeLayout(state.activeView, state);
        },
    };
}

