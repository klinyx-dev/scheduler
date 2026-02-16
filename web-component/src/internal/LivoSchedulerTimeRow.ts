import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { SchedulerCell } from "@livo/scheduler-core";
import "./LivoSchedulerSlotCell";
import { en } from "@livo/datetime";

@customElement("livo-scheduler-time-row")
export class LivoSchedulerTimeRow extends LitElement {
    @property({ type: Number }) hour = 0;
    @property({ type: Array }) days: Date[] = [];
    @property({ type: Array }) cells: SchedulerCell[] = [];
    @property({ type: String }) locale = "en-US";

    render() {
        const label = en.formatHourEn(this.hour);

        return html`
            <div class="time-row">
                <div class="time-cell">${label}</div>
                
                ${this.days.map((day, dayIndex) => {
                    const cell = this.cells.find((c) => c.dayIndex === dayIndex);
                    
                    return html`
                        <livo-scheduler-slot-cell 
                            .cell=${cell ?? null}
                            .dayIndex=${dayIndex}
                            .hour=${this.hour}
                            .date=${cell?.date ?? day}
                        ></livo-scheduler-slot-cell>
                    `;
                })}
            </div>
        `;
    }

    static styles = css`
        :host { 
            display: block; 
        }
        .time-row {
            display: grid;
            grid-template-columns: 3.5rem repeat(7, minmax(0, 1fr));
            min-height: 4rem;
        }
        .time-cell {
            padding: 0.25rem 0.5rem;
            text-align: right;
            border-right: 1px solid #d4d4d8;
            font-size: 0.75rem;
            color: #6b7280;
            min-height: 100%;
            box-sizing: border-box;
        }
    `;
}