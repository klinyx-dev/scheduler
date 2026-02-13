import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { SchedulerViewModel } from "../scheduler-contract";
import "./LivoSchedulerTimeRow";
import "./LivoSchedulerNowIndicator";

@customElement("livo-scheduler-week-grid")
export class LivoSchedulerWeekGrid extends LitElement {
    @property({ type: Object }) viewModel!: SchedulerViewModel;
    @property({ type: String }) locale = "en-US";

    render() {
        if (!this.viewModel) return html`<div class="empty">No view model</div>`;

        const { days, timeSlots, cells, nowIndicator } = this.viewModel;
        const locale = this.locale;

        return html`
            <div class="week-grid-body">
                ${nowIndicator?.visible 
                        ? html`
                            <livo-scheduler-now-indicator 
                                    .topPercent=${nowIndicator.topPercent} 
                                    .dayIndex=${nowIndicator.dayIndex} 
                                    .totalDays=${days.length} 
                                    timeColumnWidth="3.5rem"
                            ></livo-scheduler-now-indicator>
                        ` 
                        : ""} 
                
                ${timeSlots.map(
                    (hour) => html`
                        <livo-scheduler-time-row 
                                .hour=${hour} 
                                .days=${days} 
                                .cells=${cells.filter((c) => c.hour === hour)} 
                                .locale=${locale}
                        ></livo-scheduler-time-row>
                    `
                )}
            </div>
    `;
    }

    static styles = css` 
        :host { 
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0; 
        }
        .empty { 
            padding: 1rem;
            color: #71717a;
        }
        .week-grid-body {
            position: relative;
            flex: 1;
            min-height: 0;
            border-top: none;
        }
  `;
}