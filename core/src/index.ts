// Public entrypoint for @livo/scheduler-core.
// Expose only the stable, intended surface for consumers and renderers.

// Core scheduler factory and interface
export { createScheduler, type Scheduler } from "./scheduler";

// Domain & configuration types
export type {
    DateRange,
    SchedulerEvent,
    Resource,
    SchedulerConstraints,
} from "./model/types";
export type { SchedulerConfig } from "./config/types";

// Interaction and view contracts
export type {
    SchedulerAction,
    PointerCoordinates,
    PointerDownPayload,
    PointerMovePayload,
    SchedulerState,
} from "./interaction/types";
export {
    VIEW_TYPES,
    type ViewType,
    type SchedulerView,
} from "./view/types";

// Layout model
export type {
    LayoutResult,
    Column,
    Row,
    PositionedEvent,
    PositionedLine,
} from "./layout/types";

// Date abstraction
export type { DateAdapter, Duration, TimeUnit } from "./date/types";
export { TIME_UNIT } from "./date/types";