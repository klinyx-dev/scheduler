import {INTERACTION_PHASES, SchedulerState} from "../types";
import { INTERNAL_ACTIONS, type InternalAction } from "./actions";

/**
 * Reducer function to update the state of the scheduler.
 */
export function reducer(state: SchedulerState, action: InternalAction): SchedulerState {
    switch (action.type) {
        case INTERNAL_ACTIONS.SET_EVENTS:
            return { ...state, events: action.payload };
        case INTERNAL_ACTIONS.SET_RESOURCES:
            return { ...state, resources: action.payload };
        case INTERNAL_ACTIONS.SET_VIEW:
            return { ...state, activeView: action.payload };
        case INTERNAL_ACTIONS.SET_DATE_RANGE:
            return { ...state, dateRange: action.payload };
        case INTERNAL_ACTIONS.UPDATE_CONFIG: {
            const { constraints } = action.payload;
            return constraints === undefined ? state : { ...state, constraints };
        }
        case INTERNAL_ACTIONS.POINTER_DOWN: {
            const target = action.payload.target;
            const coords = action.payload.coordinates;

            if (target?.eventId) {
                const event = state.events.find(e => e.id === target.eventId);
                if (!event) return state;

                if (target.edge === "start" || target.edge === "end") {
                    return {
                        ...state,
                        interaction: {
                            phase: INTERACTION_PHASES.RESIZING,
                            eventId: event.id,
                            edge: target.edge,
                            dragStart: coords,
                            current: coords,
                            eventStart: event.start,
                            eventEnd: event.end,
                        },
                    };
                }

                return {
                    ...state,
                    interaction: {
                        phase: INTERACTION_PHASES.DRAGGING,
                        eventId: event.id,
                        dragStart: coords,
                        current: coords,
                        eventStart: event.start,
                        eventEnd: event.end,
                    },
                };
            }

            if (target?.slotDate != null) {
                return {
                    ...state,
                    interaction: {
                        phase: INTERACTION_PHASES.SELECTING_RANGE,
                        dragStart: coords,
                        current: coords,
                        anchorDate: target.slotDate,
                    },
                };
            }

            return state;
        }
        case INTERNAL_ACTIONS.POINTER_MOVE: {
            const { phase } = state.interaction;

            if (
                phase !== INTERACTION_PHASES.DRAGGING &&
                phase !== INTERACTION_PHASES.RESIZING &&
                phase !== INTERACTION_PHASES.SELECTING_RANGE
            ) {
                return state;
            }
            return {
                ...state,
                interaction: {
                    ...state.interaction,
                    current: action.payload.coordinates,
                },
            };
        }
        case INTERNAL_ACTIONS.POINTER_UP:
        case INTERNAL_ACTIONS.CANCEL_INTERACTION:
            return { ...state, interaction: { phase: INTERACTION_PHASES.IDLE } };
        default:
            return state;
    }
}