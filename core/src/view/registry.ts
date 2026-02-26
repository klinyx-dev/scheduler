import type { SchedulerState } from "../interaction/types";
import type { LayoutResult } from "../layout/types";
import type { SchedulerView, ViewType } from "./types";

export interface ViewRegistry {
    register(view: SchedulerView): void;
    get(type: ViewType): SchedulerView | undefined;
    list(): ViewType[];
    computeLayout(type: ViewType, state: SchedulerState): LayoutResult;
}

/** Used to register and compute layouts for views */
export function createViewRegistry(fallbackLayout: (state: SchedulerState) => LayoutResult): ViewRegistry {
    const views = new Map<ViewType, SchedulerView>();

    return {
        register(view) {
            views.set(view.type, view);
        },
        get(type) {
            return views.get(type);
        },
        list() {
            return Array.from(views.keys());
        },
        computeLayout(type, state) {
            const view = views.get(type);
            if (!view) {
                return fallbackLayout(state);
            }
            return view.computeLayout(state);
        },
    };
}

