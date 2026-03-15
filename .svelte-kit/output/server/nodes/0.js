

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "prerender": false,
  "ssr": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.D_8Hw69f.js","_app/immutable/chunks/C6qdvTq4.js","_app/immutable/chunks/BisICjm1.js","_app/immutable/chunks/DA1HI07U.js","_app/immutable/chunks/D6AHNEtu.js","_app/immutable/chunks/CBkgGo--.js","_app/immutable/chunks/CazwCbQr.js","_app/immutable/chunks/PIx7JG0w.js","_app/immutable/chunks/CBxpQ1tQ.js","_app/immutable/chunks/dQ8I0R9q.js","_app/immutable/chunks/CEnZ9Wss.js","_app/immutable/chunks/BCOGmmcj.js","_app/immutable/chunks/yfQSTXll.js","_app/immutable/chunks/0roEWeV1.js"];
export const stylesheets = ["_app/immutable/assets/0.DeqxbuBo.css"];
export const fonts = [];
