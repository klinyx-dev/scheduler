# Scheduler

## Objective
Open-source, framework-agnostic scheduler library with:
- Core engine (pure TypeScript)
- Framework-free DOM renderer
- Thin Vue bridge (initially)
- Future extensibility for other bridges

### Primary Constraint:
Core engine must have zero dependency on any UI framework or browser DOM APIs

## High-level Architecture

```
+-----------------------+
|   Framework Bridge    |  (Vue only - others later)
+-----------------------+
            |
+-----------------------+
|     Default UI        |  (DOM renderer or canonical framework impl)
+-----------------------+
            |
+-----------------------+
|     Core Engine       |  (Pure TS, no DOM)
+-----------------------+
```

Dependency direction:
- Core depends on nothing UI-related
- DOM renderer depends on Core
- Bridges depends on Renderer (and Core types only)
- No circular dependencies

## Monorepo Structure

```
scheduler/
  core/
    model/
    date/
    layout/
    views/
    interaction/
    constraints/
    scheduler.ts
  renderer/
  vue/
  styles/
```

Rules:
- `core` must run in Node without polyfills
- `renderer` is the only package allowed to touch the DOM
- `vue` must not implement layout or business logic
- `styles` contains shared CSS and tokens only

## Core Engine

### Design Constraints

- No DOM access
- No window/document
- No framework reactivity
- Fully testable in isolation
- Deterministic layout
- Pure TypeScript

### Scheduler Configuration

```typescript
interface SchedulerConfig {
    initialView: string
    dateAdapter: DateAdapter
    locale?: string
    timezone?: string
    constraints?: SchedulerConstraints
}
```

### Public API

#### Scheduler Factory

```typescript
createScheduler(config: SchedulerConfig): Scheduler
```

#### Scheduler Interface

```typescript
interface Scheduler {
    setEvents(events: EventInput[]): void
    setResources?(resources: ResourceInput[]): void
    setView(viewType: string): void
    setDateRange(range: DateRange): void
    updateConfig(partial: Partial<SchedulerConfig>): void
    
    registerView(view: SchedulerView): void
    getAvailableViews(): string[]
    
    dispatch(action: SchedulerAction): void
    
    getState(): SchedulerState
    getLayout(): LayoutResult
    
    subscribe(listener: () => void): Unsubscribe
    destroy(): void
}
```

Subscription semantics:
- Listener fires after state transition and layout recomputation
- Called once per dispatch
- Synchronous by default

## Domain Model

### Event

```typescript
interface SchedulerEvent {
    id: string
    start: Date
    end: Date
    allDay?: boolean
    resourceId?: string
    meta?: unknown
}
```

Recurrence (Phase 1 Constraints)

- Optional RRULE-like minimal support
- Expansion limited to current visible date range
- Recurrence instances not permanently stored in state
- Expanded on layout computation

### Resource

```typescript
interface Resource {
    id: string
    title: string
}
```

Resource support may be disabled in v1 if not fully implemented

### DateRange

```typescript
interface DateRange {
    start: Date
    end: Date
}
```

## Data Abstraction Layer

```typescript
interface DateAdapter {
  add(date: Date, duration: Duration): Date
  diff(a: Date, b: Date, unit: TimeUnit): number
  startOf(date: Date, unit: TimeUnit): Date
  endOf(date: Date, unit: TimeUnit): Date
  format(date: Date, token: string): string
}
```

Core depends only on this interface

Provide:
- Default native adapter
- Optional adapters (dayjs, @livo/datetime)

Date logic must never leak into view layer

## View System

Views are layout calculators, no JSX, no DOM, no CSS

#### View Interface

```typescript
interface SchedulerView {
    type: string
    computeLayout(state: SchedulerState): LayoutResult
}
```

#### Built-in views (Phase 1)
- Day view
- Week view
- Month view

## Layout Model

### Coordinate System

- Origin (0, 0) = top-left of scrollable grid
- Units = CSS pixels
- Coordinates relative to grid container
- Core does not account for scroll offset
- Renderer handles scroll mapping

### Layout result

```typescript
interface LayoutResult {
  columns: Column[]
  rows: Row[]
  positionedEvents: PositionedEvent[]
  nowIndicator?: PositionedLine
}
```

#### Positioned Event

```typescript
interface PositionedEvent {
  id: string
  top: number
  height: number
  left: number
  width: number
  zIndex: number
}
```

LayoutResult must be immutable per computation cycle

## Interaction State Machine

Interaction logic must live inside core

### States:

```
Idle
DraggingEvent
ResizingEvent
SelectingRange
```

### Pointer Coordinates

```typescript
interface PointerCoordinates {
    x: number
    y: number
    timestamp: number
}
```

### Actions

```typescript
type SchedulerAction =
    | { type: 'POINTER_DOWN'; payload: PointerDownPayload }
    | { type: 'POINTER_MOVE'; payload: PointerMovePayload }
    | { type: 'POINTER_UP' }
    | { type: 'CANCEL_INTERACTION' }
```

Core responsibilites:
- Compute new tentative event times
- Validate constraints
- Snap to grid if configured
- Produce preview layout

Renderer only forwards pointer data

## Constraint System

```typescript
interface SchedulerConstraints {
    minDuration?: Duration
    maxDuration?: Duration
    allowOverlap?: boolean
    businessHours?: TimeRange[]
}
```

Constraints enforced during:
- Event creation
- Drag
- Resize

Core must reject invalid transitions

## State Structure

Core maintains internal state object:

```typescript
interface SchedulerState {
    events: SchedulerEvent[]
    resources?: Resource[]
    dateRange: DateRange
    activeView: string
    interaction: InteractionState
    constraints?: SchedulerConstraints
}
```

State updates via internal reducer:
```typescript
(state, action) => newState
```

No external store integration


## DOM Renderer

### Repsonsibilities

- Mount into container
- Subscribe to core
- Call `getLayout()`
- Render grid structure
- Render event blocks
- Apply inline geometry
- Forward interactions

No layout computation

### API

```typescript
interface SchedulerDOMRenderer {
    mount(container: HTMLElement): void
    unmount(): void
    update(): void
    destroy(): void
}
```

Factory:
```typescript
createDOMRenderer(
  scheduler: Scheduler,
  options?: RendererOptions
): SchedulerDOMRenderer
```

### DOM Structure

```html
<div class="scheduler-root">
    <div class="scheduler-grid"></div>
    <div class="scheduler-events-layer"></div>
    <div class="scheduler-overlay-layer"></div>
</div>
```

### Rendering Contract

Core guarantees:
- Layout shape stability
- Unique event IDs
- Layout consistency until next dispatch

Renderer must:
- Not mutate layout objects
- Not compute business logic
- Not recompute geometry

### Update Strategy

- Maintain `Map<eventId, HTMLElement>`
- Diff positionEvents
- Create/update/remove nodes incrementally
- Use `requestAnimationFrame` batching during drag

No full DOM teardown for minor updates

## Vue Bridge

Responsibilities:
- Render container element only
- Instantiate scheduler and DOM renderer
- Mount renderer on component mount
- Watch props and call scheduler methods

Vue must not:
- Render event blocks
- Recompute layout
- Manage interaction logic

## Styles Package

`scheduler/styles` contains:
- Base CSS
- Structural classes
- CSS variables

Example variables:
```css
--scheduler-bg
--scheduler-event-bg
--scheduler-border-color
```

No Shadow DOM
Theming via cascade

## Testing Strategy

### Core Tests (Primary Focus)
- Overlap stacking correctness
- Cross-day events
- Timezone boundary correctness
- Drag/resize state transitions
- Constraint enforcement

Test using:
```typescript
scheduler.setEvents(...)
scheduler.setView(...)
const layout = scheduler.getLayout()
```

No DOM required

### Renderer Tests
- Node creation/removal
- Style updates reflect layout geometry
- Interaction forwarding correctness

Use jsdom

## Performance Targets
- Layout resolution O(n log n) or better
- No full recompute on trivial updates
- Minimal DOM mutations during drag
- No layout thrashing

Performance violations are architectural bugs

## Non-Goals (Phase 1)
- Virtualization
- Infinite scrolling
- Complex recurrence engine
- Accessibility guarantees
- SSR support
- Resource timeline if not fully designed

## Guiding Principles
1. Core owns all business logic
2. Renderer owns DOM only
3. Geometry, not DOM, is the core output
4. Interaction is deterministic state machine
5. Bridges are integration shells
6. No framework leakage into core
7. All layout logic testable without UI













