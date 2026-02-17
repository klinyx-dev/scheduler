import {css, html, LitElement} from "lit";
import {customElement, property} from "lit/decorators.js";
import {SCHEDULER_EVENTS} from "./scheduler-contract";

@customElement('livo-scheduler-modal')
export class LivoSchedulerModal extends LitElement {
    @property({ type: Boolean, reflect: true }) open = false;
    @property({ type: String }) title = "";

    render() {
        if (!this.open) return null;
        return html`
            <div class="backdrop" @click=${this._close}></div>
            <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
                <header class="dialog-header">
                    <h2>${this.title}</h2>
                    <button class="close-btn" @click=${this._close}>Close</button>
                </header>
                <section class="dialog-body">
                    <slot></slot>
                </section>
            </div>
        `;
    }

    private _close() {
        this.dispatchEvent(new CustomEvent(SCHEDULER_EVENTS.modalClose, { bubbles: true, composed: true }));
    }

    static styles = css`
        :host {
            display: none;
        }

        :host([open]) {
            position: fixed;
            inset: 0;
            z-index: 1000;
            display: grid;
            place-items: center;
            padding: 24px;
            pointer-events: auto;
        }

        .backdrop {
            position: fixed;
            inset: 0;
            background: rgba(10, 10, 12, 0.45);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
        }

        .dialog {
            position: relative;
            pointer-events: auto;
            width: min(560px, 100%);
            max-height: min(80vh, 720px);
            overflow: hidden;

            border-radius: 16px;
            background: rgba(255, 255, 255, 0.92);
            border: 1px solid rgba(255, 255, 255, 0.6);

            box-shadow:
                    0 20px 50px rgba(0, 0, 0, 0.22),
                    0 8px 16px rgba(0, 0, 0, 0.12);
        }

        .dialog-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;

            padding: 14px 16px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }

        .dialog-header h2 {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.2px;
            color: rgba(17, 24, 39, 0.92);
        }

        .dialog-body {
            padding: 16px;
            overflow: auto;
            max-height: calc(80vh - 52px);
            color: rgba(17, 24, 39, 0.86);
            font-size: 14px;
            line-height: 1.45;
        }

        .close-btn {
            border: 1px solid rgba(0, 0, 0, 0.12);
            background: rgba(255, 255, 255, 0.7);
            color: rgba(17, 24, 39, 0.8);

            border-radius: 10px;
            padding: 6px 10px;
            cursor: pointer;

            font-size: 12px;
            font-weight: 600;
        }

        .close-btn:hover {
            background: rgba(255, 255, 255, 0.9);
        }

        .close-btn:active {
            transform: translateY(1px);
        }

        @media (prefers-reduced-motion: no-preference) {
            .dialog {
                animation: pop 140ms ease-out;
            }
            @keyframes pop {
                from { transform: translateY(6px) scale(0.99); opacity: 0; }
                to   { transform: translateY(0) scale(1); opacity: 1; }
            }
        }
    `;
}