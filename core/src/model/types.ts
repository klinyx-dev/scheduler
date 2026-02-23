// Domain-level types

import type { Duration } from "../date";

/**
 * Represents the visible time window.
 */
export interface DateRange {
    start: Date;
    end: Date;
}

/**
 * Represents a single event in the scheduler.
 */
export interface SchedulerEvent {
    id: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    resourceId?: string;
    meta?: unknown;
    title?: string;
}

/**
 * Represents a resource in the scheduler, e.g. a doctor or room.
 */
export interface Resource {
    id: string;
    title: string;
}

/**
 * A time range expressed in minutes from midnight.
 */
export interface TimeRange {
    start: number; // minutes from midnight
    end: number;
}

/**
 * Constraints that apply to events during creation and interaction.
 */
export interface SchedulerConstraints {
    minDuration?: Duration;
    maxDuration?: Duration;
    allowOverlap?: boolean;
    businessHours?: TimeRange[];
}
