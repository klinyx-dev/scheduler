interface NowParams {
    now: Date;
    startHour: number;
    endHour: number;
    dayIndex: number;
}

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