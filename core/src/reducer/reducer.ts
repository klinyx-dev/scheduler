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
            if (!target?.eventId) return state;

            const event = state.events.find(e => e.id === target.eventId);
            if (!event) return state;

            return {
                ...state,
                interaction: {
                    phase: INTERACTION_PHASES.DRAGGING,
                    eventId: event.id,
                    dragStart: action.payload.coordinates,
                    current: action.payload.coordinates,
                    eventStart: event.start,
                    eventEnd: event.end,
                },
            };
        }
        case INTERNAL_ACTIONS.POINTER_MOVE: {
            if (state.interaction.phase !== INTERACTION_PHASES.DRAGGING && state.interaction.phase !== INTERACTION_PHASES.RESIZING) {
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