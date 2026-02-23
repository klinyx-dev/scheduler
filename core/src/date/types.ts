export type Duration = {
    years?: number;
    months?: number;
    weeks?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
}

export const TIME_UNIT = {
    SECOND: "second",
    MINUTE: "minute",
    HOUR: "hour",
    DAY: "day",
    WEEK: "week",
    MONTH: "month",
    YEAR: "year",
}

export type TimeUnit = (typeof TIME_UNIT)[keyof typeof TIME_UNIT];

export interface DateAdapter {
    add(date: Date, duration: Duration): Date
    diff(a: Date, b: Date, unit: TimeUnit): number
    startOf(date: Date, unit: TimeUnit): Date
    endOf(date: Date, unit: TimeUnit): Date
    format(date: Date, token: string): string
}