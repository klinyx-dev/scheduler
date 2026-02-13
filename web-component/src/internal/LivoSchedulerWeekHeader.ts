import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import {isSameDay} from "@livo/datetime";

@customElement("livo-scheduler-week-header")
export class LivoSchedulerWeekHeader extends LitElement {
    @property({ type: Array }) days: Date[] = [];
    @property({ type: String }) locale = "en-US";

    private _isToday(day: Date): boolean {
        return isSameDay(day, new Date());
    }

    render() {
        return html`
            <div class="week-header">
                <div class="header-corner"></div>
                ${this.days.map(
                    (day) => html`
                        <div class="header-cell">
                            <div class="day-header-cell">
                                <span class="day-label">
                                    ${day.toLocaleDateString(this.locale, { weekday: "short" })}
                                </span>
                                <span class="date-num ${this._isToday(day) ? "date-num--today" : ""}">
                                    ${day.getDate()}
                                </span>
                            </div>
                        </div>
                    `
                )}
            </div>
        `;
    }

    static styles = css` 
        :host { 
            display: block; 
        } 
        .week-header {
            display: grid;
            grid-template-columns: 3.5rem repeat(7, minmax(0, 1fr));
            border-bottom: 1px solid #d4d4d8;
            background: #fafafa;
        } 
        .header-corner { 
            border-right: 1px solid #d4d4d8; 
        }
        .header-cell {
            display: flex;
            flex-direction: column;
            align-items: center;
            border-right: 1px solid #e5e7eb;
            padding: 0.5rem 0;
        }
        .header-cell:last-of-type { 
            border-right: none; 
        }
        .day-header-cell {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
        }
        .day-label {
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #52525b;
        }
        .date-num {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 1.75rem;
            height: 1.75rem;
            font-size: 0.875rem;
            font-variant-numeric: tabular-nums;
            border-radius: 9999px;
            color: #52525b;
        }
        .date-num--today {
            background: #171717;
            font-weight: 600;
            color: white;
        }
  `;
}