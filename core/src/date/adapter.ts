import {DateAdapter, TIME_UNIT} from "./types"

/**
 * Default implementation of the DateAdapter interface using native JavaScript Date objects.
 * 
 * Core never talks to a specific date library
 * It only knows about DateAdapter, 
 * so later we can plug in other date libraries like dayjs, @livo/datetime, etc.
 * outside the core package
 */
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
            case TIME_UNIT.SECOND: return ms / 1000
            case TIME_UNIT.MINUTE: return ms / (1000 * 60)
            case TIME_UNIT.HOUR: return ms / (1000 * 60 * 60)
            case TIME_UNIT.DAY: return ms / (1000 * 60 * 60 * 24)
            case TIME_UNIT.WEEK: return ms / (1000 * 60 * 60 * 24 * 7)
            case TIME_UNIT.MONTH: {
                const years = b.getFullYear() - a.getFullYear()
                const months = b.getMonth() - a.getMonth()
                return years * 12 + months
            }
            case TIME_UNIT.YEAR:
                return b.getFullYear() - a.getFullYear()
            default:
                return ms
        }
    },
    startOf(date, unit) {
        const out = new Date(date)
        if (unit === TIME_UNIT.DAY || unit === TIME_UNIT.HOUR || unit === TIME_UNIT.MINUTE || unit === TIME_UNIT.SECOND) {
            out.setSeconds(0, 0)
        }
        if (unit === TIME_UNIT.DAY || unit === TIME_UNIT.HOUR || unit === TIME_UNIT.MINUTE) out.setMinutes(0)
        if (unit === TIME_UNIT.DAY || unit === TIME_UNIT.HOUR) out.setHours(0)
        if (unit === TIME_UNIT.DAY) out.setHours(0)
        if (unit === TIME_UNIT.WEEK) {
            out.setHours(0, 0, 0, 0)
            const d = out.getDay()
            const diff = out.getDate() - d + (d === 0 ? -6 : 1)
            out.setDate(diff)
        }
        if (unit === TIME_UNIT.MONTH) {
            out.setDate(1)
            out.setHours(0, 0, 0, 0)
        }
        if (unit === TIME_UNIT.YEAR) {
            out.setMonth(0, 1)
            out.setHours(0, 0, 0, 0)
        }
        return out
    },
    endOf(date, unit) {
        const start = this.startOf(date, unit)
        switch (unit) {
            case TIME_UNIT.DAY: return this.add(start, { days: 1 })
            case TIME_UNIT.WEEK: return this.add(start, { weeks: 1 })
            case TIME_UNIT.MONTH: return this.add(start, { months: 1 })
            case TIME_UNIT.YEAR: return this.add(start, { years: 1 })
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