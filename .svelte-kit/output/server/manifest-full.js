export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["icons/blento.png","icons/bluecast.png","icons/bluesky.png","icons/deckblue.png","icons/deer.png","icons/frontpage.png","icons/graysky.png","icons/leaflet.png","icons/nooki.png","icons/pipup.png","icons/skyfeed.png","icons/skyview.png","icons/smokesignal.png","icons/streamplace.png","icons/tangled.png","icons/teal.png","icons/wisp.png","oauth-client-metadata.json","vite.svg"]),
	mimeTypes: {".png":"image/png",".json":"application/json",".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.DN1MoPC5.js",app:"_app/immutable/entry/app.DKhuDzaR.js",imports:["_app/immutable/entry/start.DN1MoPC5.js","_app/immutable/chunks/BCOGmmcj.js","_app/immutable/chunks/BisICjm1.js","_app/immutable/chunks/CazwCbQr.js","_app/immutable/chunks/DA1HI07U.js","_app/immutable/entry/app.DKhuDzaR.js","_app/immutable/chunks/BisICjm1.js","_app/immutable/chunks/D6AHNEtu.js","_app/immutable/chunks/C6qdvTq4.js","_app/immutable/chunks/DA1HI07U.js","_app/immutable/chunks/CBkgGo--.js","_app/immutable/chunks/CazwCbQr.js","_app/immutable/chunks/0roEWeV1.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/oauth/callback",
				pattern: /^\/oauth\/callback\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/project/[slug]",
				pattern: /^\/project\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
