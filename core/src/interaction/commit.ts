import {SchedulerEvent} from "../model/types";
import {INTERACTION_PHASES, SchedulerState} from "./types";
import {DateAdapter} from "../date";
import {applyConstraints} from "../constraints/applyConstraints";
import {SchedulerConfig} from "../config/types";
import {INTERNAL_ACTIONS, InternalAction} from "../reducer/actions";
import {pointerDeltaToMinutes} from "../layout/weekViewLayout";
import {snapMinutes} from "../core/snap";

const SLOT_HEIGHT_PX = 48;
const MINUTES_PER_SLOT = 60;

function applyCommit(
    events: SchedulerEvent[],
    eventId: string,
    newStart: Date,
    newEnd: Date,
    state: SchedulerState,
    adapter: DateAdapter
): SchedulerEvent[] {
    const updated = events.map((event) =>
        event.id === eventId
            ? { ...event, start: newStart, end: newEnd }
            : event
    );

    return applyConstraints(updated, state.constraints, adapter);
}

export function commitResizeIfAny(
    state: SchedulerState,
    configRef: { current: SchedulerConfig },
    adapter: DateAdapter,
    dispatchInternal: (action: InternalAction) => void
): void {
    const { interaction, events } = state;

    if (interaction.phase !== INTERACTION_PHASES.RESIZING) return;

    const snap = configRef.current.snapMinutes ?? 0;
    const deltaMinutes = pointerDeltaToMinutes(
        interaction.dragStart,
        interaction.current,
        SLOT_HEIGHT_PX,
        MINUTES_PER_SLOT,
    );

    const snappedDelta = snapMinutes(deltaMinutes, snap > 0 ? snap : undefined);
    const deltaMs = snappedDelta * 60_000;

    let newStart = new Date(interaction.eventStart.getTime());
    let newEnd = new Date(interaction.eventEnd.getTime());

    if (interaction.edge === "start") {
        newStart = new Date(interaction.eventStart.getTime() + deltaMs);
        if (newStart.getTime() >= newEnd.getTime()) return;
    } else {
        newEnd = new Date(interaction.eventEnd.getTime() + deltaMs);
        if (newEnd.getTime() <= newStart.getTime()) return;
    }

    const constrained = applyCommit(
        events,
        interaction.eventId,
        newStart,
        newEnd,
        state,
        adapter
    );

    dispatchInternal({ type: INTERNAL_ACTIONS.SET_EVENTS, payload: constrained });
}

export function commitDragIfAny(
    state: SchedulerState,
    configRef: { current: SchedulerConfig },
    adapter: DateAdapter,
    dispatchInternal: (action: InternalAction) => void
): void {
    const { interaction, events } = state;

    if (interaction.phase !== INTERACTION_PHASES.DRAGGING) return;

    const snap = configRef.current.snapMinutes ?? 0;
    const deltaMinutes = pointerDeltaToMinutes(
        interaction.dragStart,
        interaction.current,
        SLOT_HEIGHT_PX,
        MINUTES_PER_SLOT,
    );

    const snappedDelta = snapMinutes(deltaMinutes, snap > 0 ? snap : undefined);
    const deltaMs = snappedDelta * 60_000;

    const newStart = new Date(interaction.eventStart.getTime() + deltaMs);
    const newEnd = new Date(interaction.eventEnd.getTime() + deltaMs);

    const constrained = applyCommit(
        events,
        interaction.eventId,
        newStart,
        newEnd,
        state,
        adapter
    );
    dispatchInternal({ type: INTERNAL_ACTIONS.SET_EVENTS, payload: constrained });
}