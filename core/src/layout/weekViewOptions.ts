export const WEEK_VIEW_OPTIONS = {
    startHour: 0,
    endHour: 24,
    slotHeightPx: 48,
    columnWidthPx: 120,
} as const;

export type WeekViewOptions = typeof WEEK_VIEW_OPTIONS;