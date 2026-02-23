// Interaction-related types: pointer, interaction state, actions and scheduler state.

import type { DateRange, Resource, SchedulerConstraints, SchedulerEvent } from "../model/types";
import type { ViewType } from "../view/types";

export interface PointerCoordinates {
    x: number;
    y: number;
    timestamp: number;
}

export interface PointerDownPayload {
    coordinates: PointerCoordinates;
    target?: {
        eventId?: string;
        columnIndex?: number;
        rowIndex?: number;
    };
}

export interface PointerMovePayload {
    coordinates: PointerCoordinates;
}

export type SchedulerAction =
    | { type: "POINTER_DOWN"; payload: PointerDownPayload }
    | { type: "POINTER_MOVE"; payload: PointerMovePayload }
    | { type: "POINTER_UP" }
    | { type: "CANCEL_INTERACTION" };

// Interaction phases and state machine.

export const INTERACTION_PHASES = {
    IDLE: "idle",
    DRAGGING: "dragging",
    RESIZING: "resizing",
    SELECTING_RANGE: "selectingRange",
} as const;

export type InteractionPhase = (typeof INTERACTION_PHASES)[keyof typeof INTERACTION_PHASES];

export type InteractionState =
    | { phase: typeof INTERACTION_PHASES.IDLE }
    | {
        phase: typeof INTERACTION_PHASES.DRAGGING;
        eventId: string;
        dragStart: PointerCoordinates;
        current: PointerCoordinates;
        eventStart: Date;
        eventEnd: Date;
    }
    | {
        phase: typeof INTERACTION_PHASES.RESIZING;
        eventId: string;
        edge: "start" | "end";
        dragStart: PointerCoordinates;
        current: PointerCoordinates;
        eventStart: Date;
        eventEnd: Date;
    }
    | {
        phase: typeof INTERACTION_PHASES.SELECTING_RANGE;
        dragStart: PointerCoordinates;
        anchorDate: Date;
    };

/**
 * Internal state held by the core engine.
 */
export interface SchedulerState {
    events: SchedulerEvent[];
    resources?: Resource[];
    dateRange: DateRange;
    activeView: ViewType;
    interaction: InteractionState;
    constraints?: SchedulerConstraints;
}

