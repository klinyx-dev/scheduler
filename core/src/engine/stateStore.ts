import type { SchedulerState } from "../interaction/types";
import type { InternalAction } from "../reducer/actions";
import { reducer } from "../reducer/reducer";

export interface StateStore {
    getState(): SchedulerState;
    dispatchInternal(action: InternalAction): void;
    subscribe(listener: () => void): () => void;
    destroy(): void;
}

/** 
 * Creates an internal store around the reducer;
 * dispatch asserts invariants and notifies subscribers
 */
export function createStateStore(initialState: SchedulerState): StateStore {
    let state = initialState;
    const listeners: Array<() => void> = [];

    function notify() {
        listeners.forEach((listener) => listener());
    }

    function dispatchInternal(action: InternalAction) {
        state = reducer(state, action);
        notify();
    }

    return {
        getState: () => state,
        dispatchInternal,
        subscribe(listener) {
            listeners.push(listener);
            return () => {
                const i = listeners.indexOf(listener);
                if (i !== -1) listeners.splice(i, 1);
            };
        },
        destroy() {
            listeners.length = 0;
        },
    };
}

