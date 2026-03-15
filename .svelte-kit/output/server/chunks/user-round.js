import { s as sanitize_props, a as spread_props, b as slot } from "./index2.js";
import { I as Icon } from "./Icon.js";
function html(value) {
  var html2 = String(value ?? "");
  var open = "<!---->";
  return open + html2 + "<!---->";
}
const projects = [
  {
    id: "1",
    slug: "bluesky",
    name: "Bluesky",
    description: "Decentralized social network built on ATProto. The flagship ATProto application offering a Twitter-like experience.",
    icon: "🦋",
    iconUrl: "/icons/bluesky.png",
    url: "https://bsky.app",
    alternativeTo: ["Twitter/X"],
    isOpenSource: true,
    authType: "oauth",
    repositoryUrl: "https://github.com/bluesky-social",
    tags: ["social", "client", "microblogging"]
  },
  {
    id: "2",
    slug: "deer",
    name: "Deer",
    description: "Fork of the Bluesky client with enhanced features and customization options.",
    icon: "💬",
    iconUrl: "/icons/deer.png",
    url: "https://deer.social",
    alternativeTo: ["Twitter/X"],
    isOpenSource: true,
    authType: "oauth",
    repositoryUrl: "https://github.com/a-viv-a/deer-social",
    tags: [
      "social",
      "client",
      "microblogging",
      "customization",
      "alternative-client"
    ]
  },
  {
    id: "3",
    slug: "graysky",
    name: "Graysky",
    description: "Native mobile client for Bluesky with smooth animations and native feel.",
    icon: "🌫️",
    iconUrl: "/icons/graysky.png",
    url: "https://graysky.app",
    alternativeTo: ["Twitter/X"],
    isOpenSource: true,
    authType: "oauth",
    repositoryUrl: "https://github.com/mozzius/graysky",
    tags: ["social", "client", "microblogging", "mobile", "alternative-client"]
  },
  {
    id: "4",
    slug: "frontpage",
    name: "Frontpage",
    description: "Link aggregator built on ATProto.",
    icon: "📰",
    iconUrl: "/icons/frontpage.png",
    url: "https://frontpage.fyi",
    alternativeTo: ["Hacker News", "Reddit"],
    isOpenSource: true,
    authType: "oauth",
    repositoryUrl: "https://github.com/likeandscribe/frontpage",
    tags: ["links", "aggregator", "discussion", "community"]
  },
  {
    id: "5",
    slug: "leaflet",
    name: "Leaflet",
    description: "Long-form blogging platform with markdown support.",
    icon: "📝",
    iconUrl: "/icons/leaflet.png",
    url: "https://leaflet.pub",
    alternativeTo: ["Medium", "Substack"],
    isOpenSource: true,
    authType: "oauth",
    repositoryUrl: "https://tangled.org/leaflet.pub/leaflet",
    tags: ["blogging", "writing", "markdown", "long-form"]
  },
  {
    id: "6",
    slug: "smoke-signal",
    name: "Smoke Signal",
    description: "Event planning and RSVP platform.",
    icon: "📅",
    iconUrl: "/icons/smokesignal.png",
    url: "https://smokesignal.events",
    alternativeTo: ["Eventbrite"],
    isOpenSource: true,
    authType: "oauth",
    repositoryUrl: "https://tangled.org/smokesignal.events/smokesignal",
    tags: ["events", "rsvp", "planning", "community"]
  },
  {
    id: "7",
    slug: "deck-blue",
    name: "deck.blue",
    description: "TweetDeck-style multi-column interface for Bluesky power users.",
    icon: "📊",
    iconUrl: "/icons/deckblue.png",
    url: "https://deck.blue",
    alternativeTo: ["TweetDeck"],
    isOpenSource: false,
    authType: "app-password",
    tags: ["social", "dashboard", "power-user", "columns"]
  },
  {
    id: "8",
    slug: "skyview",
    name: "Skyview",
    description: "Public thread reader for Bluesky that lets you share posts with anyone.",
    icon: "👁️",
    iconUrl: "/icons/skyview.png",
    url: "https://skyview.social",
    alternativeTo: ["Twitter/X Embeds"],
    isOpenSource: true,
    authType: "none",
    repositoryUrl: "https://github.com/badlogic/skyview",
    tags: ["viewer", "embed", "sharing", "public"]
  },
  {
    id: "9",
    slug: "bluecast",
    name: "Bluecast",
    description: "Voice message sharing and livestreaming platform.",
    icon: "🎙️",
    iconUrl: "/icons/bluecast.png",
    url: "https://bluecast.app",
    alternativeTo: ["Twitter/X Spaces"],
    isOpenSource: false,
    authType: "oauth",
    tags: ["voice", "audio", "livestream", "media"]
  },
  {
    id: "10",
    slug: "skyfeed",
    name: "SkyFeed",
    description: "Custom client and feed builder for Bluesky.",
    icon: "🐦",
    iconUrl: "/icons/skyfeed.png",
    url: "https://skyfeed.app",
    alternativeTo: ["Twitter/X Lists"],
    isOpenSource: true,
    authType: "app-password",
    repositoryUrl: "https://github.com/skyfeed-dev",
    tags: [
      "feeds",
      "curation",
      "filtering",
      "customization",
      "alternative-client"
    ]
  },
  {
    id: "11",
    slug: "tangled",
    name: "Tangled",
    description: "Decentralized Git forge and collaboration platform with the ability to self-host.",
    icon: "🐑",
    iconUrl: "/icons/tangled.png",
    url: "https://tangled.org",
    alternativeTo: ["GitHub", "GitLab", "Gitea"],
    isOpenSource: true,
    authType: "oauth",
    repositoryUrl: "https://tangled.org/tangled.org/core",
    tags: ["git", "forge", "collaboration", "community", "self-hosted"]
  },
  {
    id: "12",
    slug: "streamplace",
    name: "Streamplace",
    description: "Livestreaming platform built on ATProto.",
    icon: "📺",
    iconUrl: "/icons/streamplace.png",
    url: "https://stream.place",
    alternativeTo: ["Twitch"],
    isOpenSource: true,
    authType: "oauth",
    repositoryUrl: "https://tangled.org/stream.place/streamplace",
    tags: ["video", "livestream", "media", "community"]
  },
  {
    id: "13",
    slug: "wisp",
    name: "Wisp",
    description: "Easy-to-use static site hosting and deployment.",
    icon: "🧚",
    iconUrl: "/icons/wisp.png",
    url: "https://wisp.place",
    alternativeTo: ["Netlify", "Vercel", "GitHub Pages"],
    isOpenSource: true,
    authType: "oauth",
    repositoryUrl: "https://tangled.org/nekomimi.pet/wisp.place-monorepo",
    tags: ["hosting", "web", "deployment", "power-user"]
  },
  {
    id: "14",
    slug: "teal-fm",
    name: "teal.fm",
    description: 'Music scrobbler. Currently under construction, but <a href="https://teal-relay-production.up.railway.app/">a 3rd-party live dashboard is available</a>.',
    icon: "🎵",
    iconUrl: "/icons/teal.png",
    url: "https://teal.fm",
    alternativeTo: ["Last.fm"],
    isOpenSource: true,
    authType: "none",
    repositoryUrl: "https://tangled.org/teal.fm",
    tags: ["music", "listening", "tracker"]
  },
  {
    id: "15",
    slug: "pipup",
    name: "PiPup",
    description: "Long-form blogging platform with rich formatting and diagramming support.",
    icon: "📝",
    iconUrl: "/icons/pipup.png",
    url: "https://pipup.social",
    alternativeTo: ["Medium", "Substack"],
    isOpenSource: false,
    authType: "oauth",
    tags: ["blogging", "writing", "markdown", "long-form"]
  },
  {
    id: "16",
    slug: "blento",
    name: "blento",
    description: "Minimal, friendly website building platform with optional self-hosting.",
    icon: "🟥",
    iconUrl: "/icons/blento.png",
    url: "https://blento.app",
    alternativeTo: ["Carrd", "Linktree"],
    isOpenSource: true,
    authType: "oauth",
    repositoryUrl: "https://github.com/flo-bit/blento",
    tags: ["hosting", "web", "builder", "self-hosted"]
  },
  {
    id: "17",
    slug: "nooki",
    name: "nooki",
    description: "Minimal discussion and community platform a la Reddit.",
    icon: "🩹",
    iconUrl: "/icons/nooki.png",
    url: "https://nooki.me",
    alternativeTo: ["Reddit"],
    isOpenSource: false,
    authType: "oauth",
    tags: ["links", "aggregator", "discussion", "community", "forums"]
  }
];
function getAllTags() {
  const tagSet = /* @__PURE__ */ new Set();
  projects.forEach((project) => {
    project.tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}
function getAllAlternatives() {
  const altSet = /* @__PURE__ */ new Set();
  projects.forEach((project) => {
    project.alternativeTo.forEach((alt) => altSet.add(alt));
  });
  return Array.from(altSet).sort();
}
function getProjectBySlug(slug) {
  return projects.find((p) => p.slug === slug);
}
function Code($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "m16 18 6-6-6-6" }],
    ["path", { "d": "m8 6-6 6 6 6" }]
  ];
  Icon($$renderer, spread_props([
    { name: "code" },
    $$sanitized_props,
    {
      /**
       * @component @name Code
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTYgMTggNi02LTYtNiIgLz4KICA8cGF0aCBkPSJtOCA2LTYgNiA2IDYiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/code
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function External_link($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "M15 3h6v6" }],
    ["path", { "d": "M10 14 21 3" }],
    [
      "path",
      {
        "d": "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "external-link" },
    $$sanitized_props,
    {
      /**
       * @component @name ExternalLink
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTUgM2g2djYiIC8+CiAgPHBhdGggZD0iTTEwIDE0IDIxIDMiIC8+CiAgPHBhdGggZD0iTTE4IDEzdjZhMiAyIDAgMCAxLTIgMkg1YTIgMiAwIDAgMS0yLTJWOGEyIDIgMCAwIDEgMi0yaDYiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/external-link
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Key_round($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
      }
    ],
    [
      "circle",
      { "cx": "16.5", "cy": "7.5", "r": ".5", "fill": "currentColor" }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "key-round" },
    $$sanitized_props,
    {
      /**
       * @component @name KeyRound
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMi41ODYgMTcuNDE0QTIgMiAwIDAgMCAyIDE4LjgyOFYyMWExIDEgMCAwIDAgMSAxaDNhMSAxIDAgMCAwIDEtMXYtMWExIDEgMCAwIDEgMS0xaDFhMSAxIDAgMCAwIDEtMXYtMWExIDEgMCAwIDEgMS0xaC4xNzJhMiAyIDAgMCAwIDEuNDE0LS41ODZsLjgxNC0uODE0YTYuNSA2LjUgMCAxIDAtNC00eiIgLz4KICA8Y2lyY2xlIGN4PSIxNi41IiBjeT0iNy41IiByPSIuNSIgZmlsbD0iY3VycmVudENvbG9yIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/key-round
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Lock_open($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "rect",
      {
        "width": "18",
        "height": "11",
        "x": "3",
        "y": "11",
        "rx": "2",
        "ry": "2"
      }
    ],
    ["path", { "d": "M7 11V7a5 5 0 0 1 9.9-1" }]
  ];
  Icon($$renderer, spread_props([
    { name: "lock-open" },
    $$sanitized_props,
    {
      /**
       * @component @name LockOpen
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTEiIHg9IjMiIHk9IjExIiByeD0iMiIgcnk9IjIiIC8+CiAgPHBhdGggZD0iTTcgMTFWN2E1IDUgMCAwIDEgOS45LTEiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/lock-open
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Lock($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "rect",
      {
        "width": "18",
        "height": "11",
        "x": "3",
        "y": "11",
        "rx": "2",
        "ry": "2"
      }
    ],
    ["path", { "d": "M7 11V7a5 5 0 0 1 10 0v4" }]
  ];
  Icon($$renderer, spread_props([
    { name: "lock" },
    $$sanitized_props,
    {
      /**
       * @component @name Lock
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTEiIHg9IjMiIHk9IjExIiByeD0iMiIgcnk9IjIiIC8+CiAgPHBhdGggZD0iTTcgMTFWN2E1IDUgMCAwIDEgMTAgMHY0IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/lock
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Square_asterisk($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "rect",
      { "width": "18", "height": "18", "x": "3", "y": "3", "rx": "2" }
    ],
    ["path", { "d": "M12 8v8" }],
    ["path", { "d": "m8.5 14 7-4" }],
    ["path", { "d": "m8.5 10 7 4" }]
  ];
  Icon($$renderer, spread_props([
    { name: "square-asterisk" },
    $$sanitized_props,
    {
      /**
       * @component @name SquareAsterisk
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiAvPgogIDxwYXRoIGQ9Ik0xMiA4djgiIC8+CiAgPHBhdGggZD0ibTguNSAxNCA3LTQiIC8+CiAgPHBhdGggZD0ibTguNSAxMCA3IDQiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/square-asterisk
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function User_round($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["circle", { "cx": "12", "cy": "8", "r": "5" }],
    ["path", { "d": "M20 21a8 8 0 0 0-16 0" }]
  ];
  Icon($$renderer, spread_props([
    { name: "user-round" },
    $$sanitized_props,
    {
      /**
       * @component @name UserRound
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjgiIHI9IjUiIC8+CiAgPHBhdGggZD0iTTIwIDIxYTggOCAwIDAgMC0xNiAwIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/user-round
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
export {
  Code as C,
  External_link as E,
  Key_round as K,
  Lock_open as L,
  Square_asterisk as S,
  User_round as U,
  Lock as a,
  getAllTags as b,
  getProjectBySlug as c,
  getAllAlternatives as g,
  html as h,
  projects as p
};
