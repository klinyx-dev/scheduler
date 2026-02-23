// Barrel file to re-export core types by concern.
// This keeps imports stable (`./types`) while allowing internal files
// to stay focused and smaller.

export * from "./model/types";
export * from "./view/types";
export * from "./interaction/types";
export * from "./config/types";