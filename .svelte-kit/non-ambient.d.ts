
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/oauth" | "/oauth/callback" | "/project" | "/project/[slug]";
		RouteParams(): {
			"/project/[slug]": { slug: string }
		};
		LayoutParams(): {
			"/": { slug?: string };
			"/oauth": Record<string, never>;
			"/oauth/callback": Record<string, never>;
			"/project": { slug?: string };
			"/project/[slug]": { slug: string }
		};
		Pathname(): "/" | "/oauth/callback" | `/project/${string}` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/icons/blento.png" | "/icons/bluecast.png" | "/icons/bluesky.png" | "/icons/deckblue.png" | "/icons/deer.png" | "/icons/frontpage.png" | "/icons/graysky.png" | "/icons/leaflet.png" | "/icons/nooki.png" | "/icons/pipup.png" | "/icons/skyfeed.png" | "/icons/skyview.png" | "/icons/smokesignal.png" | "/icons/streamplace.png" | "/icons/tangled.png" | "/icons/teal.png" | "/icons/wisp.png" | "/oauth-client-metadata.json" | "/vite.svg" | string & {};
	}
}