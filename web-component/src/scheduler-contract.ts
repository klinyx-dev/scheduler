import type { WeekViewComputed } from "@livo/scheduler-core";

export type SchedulerViewModel = WeekViewComputed;

export interface SchedulerPresentation {
    locale?: string;
}

export interface SchedulerToolbarPresentation {
    weekLabel?: string;
    locale?: string;
}

export type SchedulerNavigateDetail = { direction: "next" | "prev" | "today" };

export type SchedulerSlotClickDetail = {
    dayIndex: number;
    hour: number;
    dateIso: string;
};

export interface SchedulerResourceOption {
    id: string;
    label: string;
}

export type SchedulerResourceChangeDetail = {
    resourceId: string | null;
};

export const SCHEDULER_EVENTS = {
    navigate: "scheduler-navigate",
    slotClick: "scheduler-slot-click",
    resourceChange: "scheduler-resource-change",
};