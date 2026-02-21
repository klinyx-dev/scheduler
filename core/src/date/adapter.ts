import type { DateAdapter, Duration, TimeUnit } from "./types"

export const nativeDateAdapter: DateAdapter = {
    add(date, d) {
        const out = new Date(date)
        if (d.seconds) out.setSeconds(out.getSeconds() + d.seconds)
        if (d.minutes) out.setMinutes(out.getMinutes() + d.minutes)
        if (d.hours) out.setHours(out.getHours() + d.hours)
        if (d.days) out.setDate(out.getDate() + d.days)
        if (d.weeks) out.setDate(out.getDate() + 7 * d.weeks)
        if (d.months) out.setMonth(out.getMonth() + d.months)
        if (d.years) out.setFullYear(out.getFullYear() + d.years)
        return out
    },
    diff(a, b, unit) {
        const ms = b.getTime() - a.getTime()
        switch (unit) {
            case 'second': return ms / 1000
            case 'minute': return ms / (1000 * 60)
            case 'hour': return ms / (1000 * 60 * 60)
            case 'day': return ms / (1000 * 60 * 60 * 24)
            default: return ms
        }
    },
    startOf(date, unit) {
        const out = new Date(date)
        if (unit === 'day' || unit === 'hour' || unit === 'minute' || unit === 'second') {
            out.setSeconds(0, 0)
        }
        if (unit === 'day' || unit === 'hour' || unit === 'minute') out.setMinutes(0)
        if (unit === 'day' || unit === 'hour') out.setHours(0)
        if (unit === 'day') out.setHours(0)
        if (unit === 'week') {
            out.setHours(0, 0, 0, 0)
            const d = out.getDay()
            const diff = out.getDate() - d + (d === 0 ? -6 : 1)
            out.setDate(diff)
        }
        if (unit === 'month') {
            out.setDate(1)
            out.setHours(0, 0, 0, 0)
        }
        if (unit === 'year') {
            out.setMonth(0, 1)
            out.setHours(0, 0, 0, 0)
        }
        return out
    },
    endOf(date, unit) {
        const start = this.startOf(date, unit)
        switch (unit) {
            case 'day': return this.add(start, { days: 1 })
            case 'week': return this.add(start, { weeks: 1 })
            case 'month': return this.add(start, { months: 1 })
            case 'year': return this.add(start, { years: 1 })
            default: return start
        }
    },
    format(date, token) {
        // minimal: common tokens (YYYY-MM-DD, HH:mm, etc.) using toISOString / getHours / getMinutes
        if (token === 'YYYY') return String(date.getFullYear())
        if (token === 'MM') return String(date.getMonth() + 1).padStart(2, '0')
        if (token === 'DD') return String(date.getDate()).padStart(2, '0')
        if (token === 'HH') return String(date.getHours()).padStart(2, '0')
        if (token === 'mm') return String(date.getMinutes()).padStart(2, '0')
        return date.toISOString()
    },
}