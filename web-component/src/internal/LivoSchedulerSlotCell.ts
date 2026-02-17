import {css, html, LitElement} from "lit";
import {customElement, property} from "lit/decorators.js";
import { SchedulerCell } from "@livo/scheduler-core";
import {SCHEDULER_EVENTS} from "../scheduler-contract";

@customElement("livo-scheduler-slot-cell")
export class LivoSchedulerSlotCell extends LitElement {
    @property({ type: Object }) cell: SchedulerCell | null = null;
    @property({ type: Number }) dayIndex = 0;
    @property({ type: Number }) hour = 0;
    @property({ type: Object }) date!: Date;

    private _onClick = () => {
        const eventId = this.cell?.events?.[0]?.id;

        this.dispatchEvent(
            new CustomEvent(SCHEDULER_EVENTS.slotClick, {
                detail: {
                    dayIndex: this.dayIndex,
                    hour: this.hour,
                    dateIso: this.date.toISOString(),
                    eventId: eventId,
                },
                bubbles: true,
                composed: true,
            })
        );
    };

    render() {
        const eventTitle = this.cell?.events?.length ? this.cell.events[0].title ?? "" : "";

        return html`
            <div class="slot-cell" @click=${this._onClick}>
                ${eventTitle ? html`<div class="event">${eventTitle}</div>` : ""}
            </div>
        `;
    }

    static styles = css`
        :host { 
            display: block;
            min-height: 100%;
        }
        .slot-cell {
            min-height: 4rem;
            border-bottom: 1px solid #e5e7eb;
            border-right: 1px solid #e5e7eb;
            cursor: pointer;
            padding: 0.125rem 0.25rem;
        }
        .slot-cell:hover { 
            background: #f4f4f5; 
        }
        .event {
            font-size: 0.75rem;
            padding: 0.125rem 0.25rem;
            background: #e0e7ff;
            border-radius: 0.25rem;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `;

}