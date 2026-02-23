/**
 * Snap a duration in minutes to the nearest multiple of snapMinutes
 * If snapMinutes is 0 or undefined, returns minutes unchanged
 */
export function snapMinutes(minutes: number, snapMinutes: number | undefined): number {
    if (snapMinutes == null || snapMinutes <= 0) return minutes;
    return Math.round(minutes / snapMinutes) * snapMinutes;
}