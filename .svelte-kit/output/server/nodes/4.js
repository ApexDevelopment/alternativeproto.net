

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/project/_slug_/_page.svelte.js')).default;
export const universal = {
  "prerender": false,
  "ssr": false,
  "load": null
};
export const universal_id = "src/routes/project/[slug]/+page.ts";
export const imports = ["_app/immutable/nodes/4.nDXsFrd-.js","_app/immutable/chunks/C6qdvTq4.js","_app/immutable/chunks/BisICjm1.js","_app/immutable/chunks/DA1HI07U.js","_app/immutable/chunks/CBkgGo--.js","_app/immutable/chunks/CazwCbQr.js","_app/immutable/chunks/dQ8I0R9q.js","_app/immutable/chunks/CBxpQ1tQ.js","_app/immutable/chunks/D6AHNEtu.js","_app/immutable/chunks/CEnZ9Wss.js","_app/immutable/chunks/PIx7JG0w.js","_app/immutable/chunks/BcVSVQdc.js"];
export const stylesheets = [];
export const fonts = [];
