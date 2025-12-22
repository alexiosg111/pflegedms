

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.CtKGgrUC.js","_app/immutable/chunks/CZmuBx9L.js","_app/immutable/chunks/C2fMyYo3.js","_app/immutable/chunks/DvXn7mPZ.js"];
export const stylesheets = [];
export const fonts = [];
