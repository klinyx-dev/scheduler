// View-related types: view identifiers and view interface.

import type { SchedulerState } from "../interaction/types";
import type { LayoutResult } from "../layout/types";

export const VIEW_TYPES = {
    WEEK: "week",
    DAY: "day",
    MONTH: "month",
} as const;

export type ViewType = (typeof VIEW_TYPES)[keyof typeof VIEW_TYPES];

export interface SchedulerView {
    type: ViewType;
    computeLayout(state: SchedulerState): LayoutResult;
}

