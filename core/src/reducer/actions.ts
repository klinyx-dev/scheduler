import {
    DateRange,
    PointerDownPayload,
    PointerMovePayload,
    Resource,
    SchedulerConfig,
    SchedulerEvent,
    ViewType
} from "../types";

/**
 * Internal actions that can be dispatched by the core.
 */
export const INTERNAL_ACTIONS = {
    SET_EVENTS: "SET_EVENTS",
    SET_RESOURCES: "SET_RESOURCES",
    SET_VIEW: "SET_VIEW",
    SET_DATE_RANGE: "SET_DATE_RANGE",
    UPDATE_CONFIG: "UPDATE_CONFIG",
    POINTER_DOWN: "POINTER_DOWN",
    POINTER_MOVE: "POINTER_MOVE",
    POINTER_UP: "POINTER_UP",
    CANCEL_INTERACTION: "CANCEL_INTERACTION",
} as const;

export type InternalAction =
    | { type: typeof INTERNAL_ACTIONS.SET_EVENTS; payload: SchedulerEvent[] }
    | { type: typeof INTERNAL_ACTIONS.SET_RESOURCES; payload: Resource[] | undefined }
    | { type: typeof INTERNAL_ACTIONS.SET_VIEW; payload: ViewType }
    | { type: typeof INTERNAL_ACTIONS.SET_DATE_RANGE; payload: DateRange }
    | { type: typeof INTERNAL_ACTIONS.UPDATE_CONFIG; payload: Partial<SchedulerConfig> }
    | { type: typeof INTERNAL_ACTIONS.POINTER_DOWN; payload: PointerDownPayload }
    | { type: typeof INTERNAL_ACTIONS.POINTER_MOVE; payload: PointerMovePayload; }
    | { type: typeof INTERNAL_ACTIONS.POINTER_UP }
    | { type: typeof INTERNAL_ACTIONS.CANCEL_INTERACTION };