import { s as sanitize_props, a as spread_props, b as slot, ab as ensure_array_like, a9 as attr_class, a7 as attr, e as escape_html, d as derived, a8 as stringify, aa as clsx, c as store_get, u as unsubscribe_stores } from "../../../../chunks/index2.js";
import { L as Lock_open, a as Lock, K as Key_round, S as Square_asterisk, U as User_round, h as html, E as External_link, C as Code, c as getProjectBySlug } from "../../../../chunks/user-round.js";
import { L as Log_in, A as Arrow_left, s as session } from "../../../../chunks/log-in.js";
import "@atcute/client";
import { I as Icon } from "../../../../chunks/Icon.js";
function File_question_mark($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"
      }
    ],
    ["path", { "d": "M12 17h.01" }],
    ["path", { "d": "M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3" }]
  ];
  Icon($$renderer, spread_props([
    { name: "file-question-mark" },
    $$sanitized_props,
    {
      /**
       * @component @name FileQuestionMark
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNiAyMmEyIDIgMCAwIDEtMi0yVjRhMiAyIDAgMCAxIDItMmg4YTIuNCAyLjQgMCAwIDEgMS43MDQuNzA2bDMuNTg4IDMuNTg4QTIuNCAyLjQgMCAwIDEgMjAgOHYxMmEyIDIgMCAwIDEtMiAyeiIgLz4KICA8cGF0aCBkPSJNMTIgMTdoLjAxIiAvPgogIDxwYXRoIGQ9Ik05LjEgOWEzIDMgMCAwIDEgNS44MiAxYzAgMi0zIDMtMyAzIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/file-question-mark
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
function Info($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["circle", { "cx": "12", "cy": "12", "r": "10" }],
    ["path", { "d": "M12 16v-4" }],
    ["path", { "d": "M12 8h.01" }]
  ];
  Icon($$renderer, spread_props([
    { name: "info" },
    $$sanitized_props,
    {
      /**
       * @component @name Info
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgLz4KICA8cGF0aCBkPSJNMTIgMTZ2LTQiIC8+CiAgPHBhdGggZD0iTTEyIDhoLjAxIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/info
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
function Message_square($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "message-square" },
    $$sanitized_props,
    {
      /**
       * @component @name MessageSquare
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjIgMTdhMiAyIDAgMCAxLTIgMkg2LjgyOGEyIDIgMCAwIDAtMS40MTQuNTg2bC0yLjIwMiAyLjIwMkEuNzEuNzEgMCAwIDEgMiAyMS4yODZWNWEyIDIgMCAwIDEgMi0yaDE2YTIgMiAwIDAgMSAyIDJ6IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/message-square
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
function Send($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"
      }
    ],
    ["path", { "d": "m21.854 2.147-10.94 10.939" }]
  ];
  Icon($$renderer, spread_props([
    { name: "send" },
    $$sanitized_props,
    {
      /**
       * @component @name Send
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTQuNTM2IDIxLjY4NmEuNS41IDAgMCAwIC45MzctLjAyNGw2LjUtMTlhLjQ5Ni40OTYgMCAwIDAtLjYzNS0uNjM1bC0xOSA2LjVhLjUuNSAwIDAgMC0uMDI0LjkzN2w3LjkzIDMuMThhMiAyIDAgMCAxIDEuMTEyIDEuMTF6IiAvPgogIDxwYXRoIGQ9Im0yMS44NTQgMi4xNDctMTAuOTQgMTAuOTM5IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/send
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
function Star($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "star" },
    $$sanitized_props,
    {
      /**
       * @component @name Star
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTEuNTI1IDIuMjk1YS41My41MyAwIDAgMSAuOTUgMGwyLjMxIDQuNjc5YTIuMTIzIDIuMTIzIDAgMCAwIDEuNTk1IDEuMTZsNS4xNjYuNzU2YS41My41MyAwIDAgMSAuMjk0LjkwNGwtMy43MzYgMy42MzhhMi4xMjMgMi4xMjMgMCAwIDAtLjYxMSAxLjg3OGwuODgyIDUuMTRhLjUzLjUzIDAgMCAxLS43NzEuNTZsLTQuNjE4LTIuNDI4YTIuMTIyIDIuMTIyIDAgMCAwLTEuOTczIDBMNi4zOTYgMjEuMDFhLjUzLjUzIDAgMCAxLS43Ny0uNTZsLjg4MS01LjEzOWEyLjEyMiAyLjEyMiAwIDAgMC0uNjExLTEuODc5TDIuMTYgOS43OTVhLjUzLjUzIDAgMCAxIC4yOTQtLjkwNmw1LjE2NS0uNzU1YTIuMTIyIDIuMTIyIDAgMCAwIDEuNTk3LTEuMTZ6IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/star
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
function ReviewForm($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let selectedRating = 0;
    let hoverRating = 0;
    let reviewText = "";
    let isGoodAlternative = true;
    let submitting = false;
    let charCount = derived(() => reviewText.length);
    let isValid = derived(() => selectedRating >= 1);
    {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="review-form-container"><form class="review-form"><div class="form-group"><label>Rating</label> <div class="star-rating" role="radiogroup" aria-label="Rating"><!--[-->`);
      const each_array = ensure_array_like([1, 2, 3, 4, 5]);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let n = each_array[$$index];
        $$renderer2.push(`<button type="button"${attr_class("star-btn", void 0, {
          "star-hover": n <= hoverRating,
          "star-filled": n <= selectedRating
        })}${attr("aria-label", `${stringify(n)} star${stringify(n > 1 ? "s" : "")}`)}>`);
        Star($$renderer2, { size: 24, strokeWidth: 2 });
        $$renderer2.push(`<!----></button>`);
      }
      $$renderer2.push(`<!--]--></div></div> <div class="form-group"><label for="review-text">Your thoughts</label> <textarea id="review-text" required="" rows="4" maxlength="3000" placeholder="Share your experience with this project...">`);
      const $$body = escape_html(reviewText);
      if ($$body) {
        $$renderer2.push(`${$$body}`);
      }
      $$renderer2.push(`</textarea> <small${attr_class("char-count", void 0, { "over-limit": charCount() > 1e3 })}><span>${escape_html(charCount())}</span>/1000 characters</small></div> <div class="form-group toggle-group"><span class="toggle-label-text">Is this a good alternative to the listed services?</span> <label class="toggle-switch" for="is-good-alt"><input type="checkbox" id="is-good-alt"${attr("checked", isGoodAlternative, true)}/> <span class="toggle-slider"></span> <span class="toggle-text toggle-yes">Yes</span> <span class="toggle-text toggle-no">No</span></label></div> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="review-form-actions"><button type="submit" class="btn btn-primary review-submit"${attr("disabled", !isValid() || submitting, true)}>`);
      {
        $$renderer2.push("<!--[-1-->");
        Send($$renderer2, { size: 16, strokeWidth: 2 });
        $$renderer2.push(`<!----> Submit Review`);
      }
      $$renderer2.push(`<!--]--></button></div> <p class="review-form-info">`);
      Info($$renderer2, { size: 14, strokeWidth: 2 });
      $$renderer2.push(`<!----> Your review will be stored in your ATProto
				repository</p></form></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function ProjectDetail($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { project, isSignedIn = false } = $$props;
    const alternativeText = project.alternativeTo.length > 0 ? project.alternativeTo.join(", ") : "Unique ATProto app";
    const authLabel = project.authType === "oauth" ? "OAuth" : project.authType === "app-password" ? "App Password" : "No Login Required";
    $$renderer2.push(`<div class="project-detail"><div class="project-detail-hero"><div class="project-detail-icon">`);
    if (project.iconUrl) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<img${attr("src", project.iconUrl)}${attr("alt", `${stringify(project.name)} icon`)} class="project-detail-icon-img"/>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<span class="project-detail-icon-emoji">${escape_html(project.icon)}</span>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="project-detail-header"><h1 class="project-detail-name">${escape_html(project.name)}</h1> <p class="project-detail-alternative">Alternative to ${escape_html(alternativeText)}</p></div></div> <div class="project-detail-badges"><span${attr_class(clsx(project.isOpenSource ? "open-source-badge" : "closed-source-badge"))}>`);
    if (project.isOpenSource) {
      $$renderer2.push("<!--[0-->");
      Lock_open($$renderer2, { size: 16, strokeWidth: 2.5 });
      $$renderer2.push(`<!----> Open Source`);
    } else {
      $$renderer2.push("<!--[-1-->");
      Lock($$renderer2, { size: 16, strokeWidth: 2.5 });
      $$renderer2.push(`<!----> Closed Source`);
    }
    $$renderer2.push(`<!--]--></span> <span${attr_class(clsx(project.authType === "oauth" ? "oauth-badge" : project.authType === "app-password" ? "app-password-badge" : "no-login-badge"))}>`);
    if (project.authType === "oauth") {
      $$renderer2.push("<!--[0-->");
      Key_round($$renderer2, { size: 16, strokeWidth: 2.5 });
    } else if (project.authType === "app-password") {
      $$renderer2.push("<!--[1-->");
      Square_asterisk($$renderer2, { size: 16, strokeWidth: 2.5 });
    } else {
      $$renderer2.push("<!--[-1-->");
      User_round($$renderer2, { size: 16, strokeWidth: 2.5 });
    }
    $$renderer2.push(`<!--]--> ${escape_html(authLabel)}</span></div> <div class="project-detail-description"><p>${html(project.description)}</p></div> <div class="project-detail-tags"><!--[-->`);
    const each_array = ensure_array_like(project.tags);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tag = each_array[$$index];
      $$renderer2.push(`<span class="tag">${escape_html(tag)}</span>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="project-detail-links"><a${attr("href", project.url)} target="_blank" rel="noopener noreferrer" class="btn btn-primary">`);
    External_link($$renderer2, { size: 18, strokeWidth: 2.5 });
    $$renderer2.push(`<!----> Visit ${escape_html(project.name)}</a> `);
    if (project.isOpenSource && project.repositoryUrl) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<a${attr("href", project.repositoryUrl)} target="_blank" rel="noopener noreferrer" class="btn btn-secondary">`);
      Code($$renderer2, { size: 18, strokeWidth: 2.5 });
      $$renderer2.push(`<!----> View Source</a>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="project-detail-review-section"><h2>`);
    Message_square($$renderer2, { size: 24, strokeWidth: 2 });
    $$renderer2.push(`<!----> Leave a Review</h2> `);
    if (isSignedIn) {
      $$renderer2.push("<!--[1-->");
      ReviewForm($$renderer2, {
        projectId: project.id,
        projectName: project.name
      });
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="review-signin-prompt">`);
      Log_in($$renderer2, { size: 20, strokeWidth: 2 });
      $$renderer2.push(`<!----> <p>Sign in with your ATProto account to leave a review</p></div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { data } = $$props;
    const project = getProjectBySlug(data.slug);
    if (project) {
      $$renderer2.push("<!--[0-->");
      ProjectDetail($$renderer2, {
        project,
        isSignedIn: store_get($$store_subs ??= {}, "$session", session) !== null
      });
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="not-found"><span class="not-found-icon">`);
      File_question_mark($$renderer2, { size: 64, strokeWidth: 1.5 });
      $$renderer2.push(`<!----></span> <h2>Project not found</h2> <p>The project you're looking for doesn't exist.</p> <a href="/" class="btn btn-primary">`);
      Arrow_left($$renderer2, { size: 18, strokeWidth: 2 });
      $$renderer2.push(`<!----> Back to catalog</a></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
