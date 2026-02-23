// Scheduler configuration types.

import type { ViewType } from "../view/types";
import type { SchedulerConstraints } from "../model/types";
import type { DateAdapter } from "../date";

/**
 * Configuration used when creating a scheduler instance.
 */
export interface SchedulerConfig {
    initialView: ViewType;
    dateAdapter?: DateAdapter;
    locale?: string;
    timezone?: string;
    constraints?: SchedulerConstraints;
    snapMinutes?: number;
}

