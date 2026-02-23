interface NowParams {
    now: Date;
    startHour: number;
    endHour: number;
    dayIndex: number;
}

/**
 * Compute the top percentage of the now indicator.
 * Used to position the now indicator in the view.
 * If the indicator is not in the range of the start and end hour, it will not be displayed.
 * 
 * @param params - The parameters for the now indicator.
 * @returns The now indicator position.
 */
export function computeNowIndicator(params: NowParams) {
    const { now, startHour, endHour, dayIndex } = params;

    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const start = startHour * 60;
    const end = endHour * 60;

    if (minutesNow < start || minutesNow > end) {
        return { visible: false, dayIndex, topPercent: 0 } as const;
    }

    const ratio = (minutesNow - start) / (end - start);
    const topPercent = ratio * 100;

    return { visible: true, dayIndex, topPercent } as const;
}