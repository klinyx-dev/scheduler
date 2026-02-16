import "./internal/LivoSchedulerWeekHeader";
import "./internal/LivoSchedulerWeekGrid";
import {css, html, LitElement} from "lit";
import { customElement, property } from "lit/decorators.js";
import {
    SchedulerPresentation,
    SchedulerViewModel
} from "./scheduler-contract";

@customElement("livo-scheduler-week-view")
export class LivoSchedulerWeekViewElement extends LitElement {
    @property({ type: Object })
    viewModel!: SchedulerViewModel;

    @property({ type: Object })
    presentation: SchedulerPresentation = { locale: "en-US" };

    render() {
        if (!this.viewModel) return html`<div>No view model</div>`;

        const locale = this.presentation?.locale ?? "en-US";

        return html`
            <div class="scheduler-week-view">
                <div class="sticky-header">
                    <livo-scheduler-week-header
                            .days=${this.viewModel.days}
                            .locale=${locale}
                    ></livo-scheduler-week-header>
                </div>
                <livo-scheduler-week-grid
                        .viewModel=${this.viewModel}
                        .locale=${locale}
                ></livo-scheduler-week-grid>
            </div>
        `;
    }

    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
            font-family: system-ui, sans-serif;
        }
        .empty { 
            padding: 1rem;
            color: #71717a;
        }
        .scheduler-week-view {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
            overflow: auto;
            -webkit-overflow-scrolling: touch;
        }
        .sticky-header {
            position: sticky;
            top: 0;
            z-index: 10;
            background: #fafafa;
            flex-shrink: 0;
        }
    `;
}