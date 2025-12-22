

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/login/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.DXsS-tgf.js","_app/immutable/chunks/CZmuBx9L.js","_app/immutable/chunks/C2fMyYo3.js"];
export const stylesheets = ["_app/immutable/assets/3.DqBdbriu.css"];
export const fonts = [];
