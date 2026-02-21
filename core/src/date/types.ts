export type Duration = {
    years?: number;
    months?: number;
    weeks?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
}

export type TimeUnit = "year" | "month" | "week" | "day" | "hour" | "minute" | "second";

export interface DateAdapter {
    add(date: Date, duration: Duration): Date
    diff(a: Date, b: Date, unit: TimeUnit): number
    startOf(date: Date, unit: TimeUnit): Date
    endOf(date: Date, unit: TimeUnit): Date
    format(date: Date, token: string): string
}