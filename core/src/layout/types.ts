import {DateRange} from "../model/types";

export interface Column {
    key: string;
    date: Date;
    width?: number;
}

export interface Row {
    key: string;
    top: number;
    height: number;
}

export interface PositionedEvent {
    id: string;
    top: number;
    height: number;
    left: number;
    width: number;
    zIndex: number;
}

export interface PositionedLine {
    top: number;
    left: number;
    width: number;
}

export interface LayoutResult {
    columns: Column[];
    rows: Row[];
    positionedEvents: PositionedEvent[];
    nowIndicator?: PositionedLine;
    selectionRange?: DateRange;
}