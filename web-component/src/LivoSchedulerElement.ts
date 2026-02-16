import {css, html, LitElement} from "lit";
import { customElement, property } from "lit/decorators.js";
import {
    SchedulerPresentation,
    SchedulerResourceOption,
    SchedulerViewModel
} from "./scheduler-contract";
import { en } from "@livo/datetime";

@customElement("livo-scheduler")
export class LivoSchedulerElement extends LitElement {
    @property({ type: Object })
    viewModel!: SchedulerViewModel;

    @property({ type: Object })
    presentation: SchedulerPresentation = { locale: "en-US" };

    @property({type: Array})
    resourceOptions: SchedulerResourceOption[] = [];

    @property({ type: String })
    selectedResourceId: string | null = null;

    render() {
        if (!this.viewModel) return html`<div>No view model</div>`;

        const locale = this.presentation?.locale ?? "en-US";
        const weekLabel = en.formatWeekRangeEn(this.viewModel.days[0]);

        return html`
            <livo-scheduler-toolbar 
                    .presentation=${{ locale, weekLabel }}
                    .doctorOptions=${this.resourceOptions}
                    .doctorId=${this.selectedResourceId}
            ></livo-scheduler-toolbar>
            
            <livo-scheduler-week-view
                    .viewModel=${this.viewModel}
                    .presentation=${this.presentation}
            ></livo-scheduler-week-view>
        `;
    }

    static styles = css`
        :host { 
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
        }
    `;
}