import {css, html, LitElement} from "lit";
import {customElement, property} from "lit/decorators.js";
import {
    SCHEDULER_EVENTS,
    SchedulerNavigateDetail,
    SchedulerResourceOption,
    SchedulerToolbarPresentation
} from "./scheduler-contract";
import "./LivoSchedulerComboboxElement";

@customElement("livo-scheduler-toolbar")
export class LivoSchedulerToolbarElement extends LitElement {
    @property({ type: Object })
    presentation: SchedulerToolbarPresentation = { locale: "en-US" };

    @property({type: Array})
    resourceOptions: SchedulerResourceOption[] = [];

    @property({ type: String })
    selectedResourceId: string | null = null;

    private _emit(direction: SchedulerNavigateDetail["direction"]) {
        this.dispatchEvent(
            new CustomEvent<SchedulerNavigateDetail>(SCHEDULER_EVENTS.navigate, {
                detail: { direction },
                bubbles: true,
                composed: true,
            })
        );
    }

    render() {
        const locale = this.presentation?.locale ?? "en-US";
        const label = this.presentation?.weekLabel ?? "";

        return html`
            <div class="toolbar">
                <div class="toolbar-left">
                    <div class="toolbar-actions">
                        <button type="button" class="btn" @click=${() => this._emit("prev")}>Prev</button>
                        <button type="button" class="btn" @click=${() => this._emit("today")}>Today</button>
                        <button type="button" class="btn" @click=${() => this._emit("next")}>Next</button>
                    </div>
                    ${label ? html`<span class="toolbar-label">${label}</span>` : ""}
                </div>

                <div class="toolbar-right">
                    <livo-scheduler-combobox
                            .options=${this.resourceOptions}
                            .value=${this.selectedResourceId}
                    ></livo-scheduler-combobox>
                </div>
            </div>
        `;
    }

    static styles = css`
        :host { 
            display: block; 
        }
        .toolbar { 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            gap: 1rem;
            margin-bottom: 0.75rem;
        }
        .toolbar-left {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        .toolbar-actions { 
            display: flex; 
            gap: 0.5rem; 
        }
        .btn { 
            padding: 0.375rem 0.75rem;
            font-size: 0.875rem;
            border: 1px solid #d4d4d8;
            border-radius: 0.375rem;
            background: #fff;
            cursor: pointer;
        }
        .btn:hover { 
            background: #f4f4f5; 
        }
        .toolbar-label { 
            font-size: 0.875rem;
            font-weight: 500;
            color: #52525b;
        }
        .toolbar-right { display: flex; align-items: center; }
    `;
}