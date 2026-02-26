import type { DateAdapter } from "../date/types";
import type { DateRange, Resource, SchedulerEvent } from "../model/types";
import type { SchedulerAction } from "../interaction/types";
import type { SchedulerConfig } from "../config/types";
import type { StateStore } from "./stateStore";
import { INTERNAL_ACTIONS, type InternalAction } from "../reducer/actions";
import { applyConstraints } from "../constraints/applyConstraints";
import { commitDragIfAny, commitResizeIfAny } from "../interaction/commit";
import type { ViewType } from "../view/types";

export interface EngineInteractions {
    setEvents(events: SchedulerEvent[]): void;
    setResources(resources: Resource[] | undefined): void;
    setView(viewType: ViewType): void;
    setDateRange(range: DateRange): void;
    updateConfig(partial: Partial<SchedulerConfig>): void;
    dispatch(action: SchedulerAction): void;
}

/**
 * Builds interaction handlers that translate external actions into internal reducer actions.
 * Applies constraints on `setEvents`, and on pointer up commits pending resize then drag before ending the interaction.
 */
export function createEngineInteractions(
    store: StateStore,
    adapter: DateAdapter,
    configRef: { current: SchedulerConfig },
): EngineInteractions {
    function dispatchInternal(action: InternalAction) {
        store.dispatchInternal(action);
    }

    return {
        setEvents(events) {
            const state = store.getState();
            const constrained = applyConstraints(
                events,
                state.constraints,
                adapter,
            );
            dispatchInternal({
                type: INTERNAL_ACTIONS.SET_EVENTS,
                payload: constrained,
            });
        },
        setResources(resources) {
            dispatchInternal({
                type: INTERNAL_ACTIONS.SET_RESOURCES,
                payload: resources,
            });
        },
        setView(viewType) {
            dispatchInternal({
                type: INTERNAL_ACTIONS.SET_VIEW,
                payload: viewType,
            });
        },
        setDateRange(range) {
            dispatchInternal({
                type: INTERNAL_ACTIONS.SET_DATE_RANGE,
                payload: range,
            });
        },
        updateConfig(partial) {
            dispatchInternal({
                type: INTERNAL_ACTIONS.UPDATE_CONFIG,
                payload: partial,
            });
        },
        dispatch(action) {
            const state = store.getState();

            switch (action.type) {
                case "POINTER_DOWN":
                    dispatchInternal({
                        type: INTERNAL_ACTIONS.POINTER_DOWN,
                        payload: action.payload,
                    });
                    break;
                case "POINTER_MOVE":
                    dispatchInternal({
                        type: INTERNAL_ACTIONS.POINTER_MOVE,
                        payload: action.payload,
                    });
                    break;
                case "POINTER_UP":
                    commitResizeIfAny(state, configRef, adapter, dispatchInternal);
                    commitDragIfAny(state, configRef, adapter, dispatchInternal);
                    dispatchInternal({ type: INTERNAL_ACTIONS.POINTER_UP });
                    break;
                case "CANCEL_INTERACTION":
                    dispatchInternal({
                        type: INTERNAL_ACTIONS.CANCEL_INTERACTION,
                    });
                    break;
            }
        },
    };
}

