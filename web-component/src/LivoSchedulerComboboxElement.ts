import {customElement, property} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import {SCHEDULER_EVENTS, SchedulerResourceChangeDetail, SchedulerResourceOption,} from "./scheduler-contract";

@customElement("livo-scheduler-combobox")
export class LivoSchedulerComboboxElement extends LitElement{
    @property({ type: Array })
    options: SchedulerResourceOption[] = [];

    @property({ type: String })
    value: string | null = null;

    private _onChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        const resourceId = select.value || null;

        this.value = resourceId;

        this.dispatchEvent(
            new CustomEvent<SchedulerResourceChangeDetail>(SCHEDULER_EVENTS.resourceChange, {
                detail: { resourceId },
                bubbles: true,
                composed: true,
            }),
        );
    }

    render() {
        return html`
      <label class="wrapper">
        <span class="label">Doctor</span>
        <select class="select" @change=${this._onChange}>
          <option value="">All doctors</option>
          ${this.options.map(
            (opt) => html`
              <option
                value=${opt.id}
                ?selected=${this.value === opt.id}
              >
                ${opt.label}
              </option>
            `,
        )}
        </select>
      </label>
    `;
    }

    static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      font-family: system-ui, sans-serif;
      font-size: 0.875rem;
      color: #374151;
    }
    .wrapper {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #6b7280;
    }
    .select {
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      border: 1px solid #d1d5db;
      font-size: 0.875rem;
      background-color: #fff;
      min-width: 10rem;
    }
  `;
}