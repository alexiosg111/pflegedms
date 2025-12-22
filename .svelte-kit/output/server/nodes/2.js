

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.OPAIsdZ8.js","_app/immutable/chunks/CZmuBx9L.js","_app/immutable/chunks/C2fMyYo3.js"];
export const stylesheets = ["_app/immutable/assets/2.Dcuogysc.css"];
export const fonts = [];
