import { s as sanitize_props, a as spread_props, b as slot, e as escape_html, d as derived, c as store_get, u as unsubscribe_stores } from "../../chunks/index2.js";
import "@atcute/client";
import { L as Log_in, A as Arrow_left, s as session } from "../../chunks/log-in.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/root.js";
import { p as page } from "../../chunks/index3.js";
import "clsx";
import { I as Icon } from "../../chunks/Icon.js";
function Hexagon($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "hexagon" },
    $$sanitized_props,
    {
      /**
       * @component @name Hexagon
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjEgMTZWOGEyIDIgMCAwIDAtMS0xLjczbC03LTRhMiAyIDAgMCAwLTIgMGwtNyA0QTIgMiAwIDAgMCAzIDh2OGEyIDIgMCAwIDAgMSAxLjczbDcgNGEyIDIgMCAwIDAgMiAwbDctNEEyIDIgMCAwIDAgMjEgMTZ6IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/hexagon
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
function Log_out($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "m16 17 5-5-5-5" }],
    ["path", { "d": "M21 12H9" }],
    ["path", { "d": "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }]
  ];
  Icon($$renderer, spread_props([
    { name: "log-out" },
    $$sanitized_props,
    {
      /**
       * @component @name LogOut
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTYgMTcgNS01LTUtNSIgLz4KICA8cGF0aCBkPSJNMjEgMTJIOSIgLz4KICA8cGF0aCBkPSJNOSAyMUg1YTIgMiAwIDAgMS0yLTJWNWEyIDIgMCAwIDEgMi0yaDQiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/log-out
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
function Plus($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [["path", { "d": "M5 12h14" }], ["path", { "d": "M12 5v14" }]];
  Icon($$renderer, spread_props([
    { name: "plus" },
    $$sanitized_props,
    {
      /**
       * @component @name Plus
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNSAxMmgxNCIgLz4KICA8cGF0aCBkPSJNMTIgNXYxNCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/plus
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
function AuthButton($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { currentSession } = $$props;
    $$renderer2.push(`<div class="auth-button-container">`);
    if (currentSession) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="auth-user"><span class="auth-handle">@${escape_html(currentSession.handle)}</span> <button class="btn btn-secondary auth-btn auth-signout">`);
      Log_out($$renderer2, { size: 18, strokeWidth: 2 });
      $$renderer2.push(`<!----> Sign out</button></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<button class="btn btn-secondary auth-btn auth-signin">`);
      Log_in($$renderer2, { size: 18, strokeWidth: 2 });
      $$renderer2.push(`<!----> Sign in</button>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { children } = $$props;
    let isDetailView = derived(() => page.url.pathname.startsWith("/project/"));
    $$renderer2.push(`<header class="site-header"><div class="header-content"><div class="logo-section">`);
    if (isDetailView()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<a href="/" class="back-link" aria-label="Back to catalog">`);
      Arrow_left($$renderer2, { size: 24, strokeWidth: 2 });
      $$renderer2.push(`<!----></a>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<span class="logo-icon">`);
      Hexagon($$renderer2, { size: 40, strokeWidth: 1.5 });
      $$renderer2.push(`<!----></span>`);
    }
    $$renderer2.push(`<!--]--> <div class="logo-text"><h1>`);
    if (isDetailView()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<a href="/" class="logo-link">ATProto Alternatives</a>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`ATProto Alternatives`);
    }
    $$renderer2.push(`<!--]--></h1> <p class="tagline">Discover decentralized alternatives built on the AT Protocol</p></div></div> <nav class="header-nav">`);
    AuthButton($$renderer2, {
      currentSession: store_get($$store_subs ??= {}, "$session", session)
    });
    $$renderer2.push(`<!----> <button class="btn btn-primary">`);
    Plus($$renderer2, { size: 18, strokeWidth: 2.5 });
    $$renderer2.push(`<!----> Submit Project</button></nav></div></header> <main class="main-content">`);
    children($$renderer2);
    $$renderer2.push(`<!----></main> <footer class="site-footer"><div class="footer-content"><p><strong>ATProto Alternatives</strong> — A community-curated catalog of
			applications built on the <a href="https://atproto.com" target="_blank" rel="noopener noreferrer">AT Protocol</a></p> <p class="footer-meta">Have a suggestion? <button class="link-button">Submit a project</button></p></div></footer> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
