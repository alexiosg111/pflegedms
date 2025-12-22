

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.cTCgK-yu.js","_app/immutable/chunks/CZmuBx9L.js","_app/immutable/chunks/C2fMyYo3.js"];
export const stylesheets = ["_app/immutable/assets/0.BWndlIRk.css"];
export const fonts = [];
