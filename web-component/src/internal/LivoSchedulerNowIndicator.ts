import {css, html, LitElement} from "lit";
import {customElement, property} from "lit/decorators.js";

@customElement("livo-scheduler-now-indicator")
export class LivoSchedulerNowIndicator extends LitElement {
    @property({ type: Number }) topPercent = 0;
    @property({ type: Number }) dayIndex = 0;
    @property({ type: Number }) totalDays = 7;
    @property({ type: String }) timeColumnWidth = "3.5rem";

    render() {
        const left = `calc(${this.timeColumnWidth} + (${this.dayIndex} / ${this.totalDays}) * (100% - ${this.timeColumnWidth}))`;
        const width = `calc((1 / ${this.totalDays}) * (100% - ${this.timeColumnWidth}))`;

        return html`
          <div
            class="now-indicator"
            style="
                top: ${this.topPercent}%; 
                left: ${left}; width: ${width};
            "
          ></div>
        `;
    }

    static styles = css`
        :host { 
            display: block;
            pointer-events: none;
            position: absolute; 
            inset: 0;
            z-index: 10; 
        }
        .now-indicator { 
            position: absolute;
            height: 1px;
            background: #b91c1c;
        }
    `;
}