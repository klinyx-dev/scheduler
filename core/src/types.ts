export type SchedulerView = "week";

export interface SchedulerOptions {
    view?: SchedulerView;
    startHour?: number;
    endHour?: number;
    locale?: string;
}

export interface SchedulerState {
    currentDate: Date;
}

export interface SchedulerEvent {
    id: string;
    start: Date;
    end: Date;
    title?: string;
}

export interface SchedulerCell {
    dayIndex: number;   // 0 .. 6
    hour: number;   // 0 .. 23
    date: Date;
    events: SchedulerEvent[];
}

export interface WeekViewComputed {
    days: Date[];
    timeSlots: number[];
    cells: SchedulerCell[];
    nowIndicator: {
        visible: boolean;
        dayIndex: number;
        topPercent: number; // 0 .. 100
    } | null;
}