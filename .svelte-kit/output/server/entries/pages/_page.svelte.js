import { s as sanitize_props, a as spread_props, b as slot, a7 as attr, a8 as stringify, e as escape_html, a9 as attr_class, aa as clsx, ab as ensure_array_like, d as derived } from "../../chunks/index2.js";
import { L as Lock_open, a as Lock, K as Key_round, S as Square_asterisk, U as User_round, h as html, E as External_link, C as Code, g as getAllAlternatives, b as getAllTags, p as projects } from "../../chunks/user-round.js";
import { I as Icon } from "../../chunks/Icon.js";
function Search_x($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "m13.5 8.5-5 5" }],
    ["path", { "d": "m8.5 8.5 5 5" }],
    ["circle", { "cx": "11", "cy": "11", "r": "8" }],
    ["path", { "d": "m21 21-4.3-4.3" }]
  ];
  Icon($$renderer, spread_props([
    { name: "search-x" },
    $$sanitized_props,
    {
      /**
       * @component @name SearchX
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTMuNSA4LjUtNSA1IiAvPgogIDxwYXRoIGQ9Im04LjUgOC41IDUgNSIgLz4KICA8Y2lyY2xlIGN4PSIxMSIgY3k9IjExIiByPSI4IiAvPgogIDxwYXRoIGQ9Im0yMSAyMS00LjMtNC4zIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/search-x
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
function Search($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "m21 21-4.34-4.34" }],
    ["circle", { "cx": "11", "cy": "11", "r": "8" }]
  ];
  Icon($$renderer, spread_props([
    { name: "search" },
    $$sanitized_props,
    {
      /**
       * @component @name Search
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMjEgMjEtNC4zNC00LjM0IiAvPgogIDxjaXJjbGUgY3g9IjExIiBjeT0iMTEiIHI9IjgiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/search
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
function ProjectCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { project } = $$props;
    const alternativeText = project.alternativeTo.length > 0 ? `Alternative to ${project.alternativeTo[0]}` : "Unique ATProto app";
    const authLabel = project.authType === "oauth" ? "OAuth" : project.authType === "app-password" ? "App Password" : "No Login";
    $$renderer2.push(`<article class="project-card"${attr("data-project-id", project.id)}><a${attr("href", `/project/${stringify(project.slug)}`)} class="project-card-link"${attr("aria-label", `View ${stringify(project.name)} details`)}><div class="project-header"><div class="project-icon">`);
    if (project.iconUrl) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<img${attr("src", project.iconUrl)}${attr("alt", `${stringify(project.name)} icon`)} class="project-icon-img"/>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<span class="project-icon-emoji">${escape_html(project.icon)}</span>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="project-title-group"><h3 class="project-name">${escape_html(project.name)}</h3> <span class="alternative-badge">${escape_html(alternativeText)}</span></div> <div class="badge-group"><span${attr_class(clsx(project.isOpenSource ? "open-source-badge" : "closed-source-badge"))}${attr("title", project.isOpenSource ? "Open Source" : "Closed Source")}>`);
    if (project.isOpenSource) {
      $$renderer2.push("<!--[0-->");
      Lock_open($$renderer2, { size: 14, strokeWidth: 2.5 });
      $$renderer2.push(`<!----> Open Source`);
    } else {
      $$renderer2.push("<!--[-1-->");
      Lock($$renderer2, { size: 14, strokeWidth: 2.5 });
      $$renderer2.push(`<!----> Closed Source`);
    }
    $$renderer2.push(`<!--]--></span> <span${attr_class(clsx(project.authType === "oauth" ? "oauth-badge" : project.authType === "app-password" ? "app-password-badge" : "no-login-badge"))}${attr("title", authLabel)}>`);
    if (project.authType === "oauth") {
      $$renderer2.push("<!--[0-->");
      Key_round($$renderer2, { size: 14, strokeWidth: 2.5 });
    } else if (project.authType === "app-password") {
      $$renderer2.push("<!--[1-->");
      Square_asterisk($$renderer2, { size: 14, strokeWidth: 2.5 });
    } else {
      $$renderer2.push("<!--[-1-->");
      User_round($$renderer2, { size: 14, strokeWidth: 2.5 });
    }
    $$renderer2.push(`<!--]--> ${escape_html(authLabel)}</span></div></div></a> <p class="project-description">${html(project.description)}</p> <div class="project-tags"><!--[-->`);
    const each_array = ensure_array_like(project.tags);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tag = each_array[$$index];
      $$renderer2.push(`<span class="tag">${escape_html(tag)}</span>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="project-links"><a${attr("href", project.url)} target="_blank" rel="noopener noreferrer" class="btn btn-primary">Visit Site `);
    External_link($$renderer2, { size: 14, strokeWidth: 2.5 });
    $$renderer2.push(`<!----></a> `);
    if (project.isOpenSource && project.repositoryUrl) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<a${attr("href", project.repositoryUrl)} target="_blank" rel="noopener noreferrer" class="btn btn-secondary">`);
      Code($$renderer2, { size: 14, strokeWidth: 2.5 });
      $$renderer2.push(`<!----> View Source</a>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></article>`);
  });
}
function SearchBar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { tags, alternatives, onFilterChange } = $$props;
    let query = "";
    let tag = "";
    let alternativeTo = "";
    let openSourceOnly = false;
    function emitFilters() {
      onFilterChange({
        query: query.toLowerCase().trim(),
        tag,
        alternativeTo,
        openSourceOnly
      });
    }
    $$renderer2.push(`<div class="search-container"><div class="search-row"><div class="search-input-wrapper"><span class="search-icon">`);
    Search($$renderer2, { size: 20, strokeWidth: 2 });
    $$renderer2.push(`<!----></span> <input type="text" placeholder="Search projects by name, description, or tags..." class="search-input"${attr("value", query)}/></div></div> <div class="filter-row"><div class="filter-group"><label for="tag-filter">Tag:</label> `);
    $$renderer2.select(
      {
        id: "tag-filter",
        class: "filter-select",
        value: tag,
        onchange: emitFilters
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`All Tags`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(tags);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let t = each_array[$$index];
          $$renderer3.option({ value: t }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(t)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div class="filter-group"><label for="alt-filter">Alternative to:</label> `);
    $$renderer2.select(
      {
        id: "alt-filter",
        class: "filter-select",
        value: alternativeTo,
        onchange: emitFilters
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`All Services`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array_1 = ensure_array_like(alternatives);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let alt = each_array_1[$$index_1];
          $$renderer3.option({ value: alt }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(alt)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div class="filter-group toggle-group"><span class="toggle-label-text">Open Source Only</span> <label class="toggle-switch toggle-switch-sm" for="opensource-filter"><input type="checkbox" id="opensource-filter"${attr("checked", openSourceOnly, true)}/> <span class="toggle-slider"></span></label></div></div></div>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let currentFilters = { query: "", tag: "", alternativeTo: "", openSourceOnly: false };
    let filteredProjects = derived(() => {
      const hasActiveFilters = currentFilters.query || currentFilters.tag || currentFilters.alternativeTo || currentFilters.openSourceOnly;
      return projects.filter((project) => {
        if (!hasActiveFilters && project.tags.includes("alternative-client")) {
          return false;
        }
        if (currentFilters.query) {
          const searchText = currentFilters.query;
          const matchesName = project.name.toLowerCase().includes(searchText);
          const matchesDescription = project.description.toLowerCase().includes(searchText);
          const matchesTags = project.tags.some((tag) => tag.toLowerCase().includes(searchText));
          const matchesAlt = project.alternativeTo.some((alt) => alt.toLowerCase().includes(searchText));
          if (!matchesName && !matchesDescription && !matchesTags && !matchesAlt) {
            return false;
          }
        }
        if (currentFilters.tag && !project.tags.includes(currentFilters.tag)) {
          return false;
        }
        if (currentFilters.alternativeTo && !project.alternativeTo.includes(currentFilters.alternativeTo)) {
          return false;
        }
        if (currentFilters.openSourceOnly && !project.isOpenSource) {
          return false;
        }
        return true;
      });
    });
    let resultsText = derived(() => {
      const total = projects.length;
      const filtered = filteredProjects().length;
      if (filtered === total) {
        return `Showing all ${total} projects`;
      }
      return `Showing ${filtered} of ${total} projects`;
    });
    function handleFilterChange(filters) {
      currentFilters = filters;
    }
    SearchBar($$renderer2, {
      tags: getAllTags(),
      alternatives: getAllAlternatives(),
      onFilterChange: handleFilterChange
    });
    $$renderer2.push(`<!----> <div class="results-count">${escape_html(resultsText())}</div> <div class="projects-grid">`);
    if (filteredProjects().length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="no-results"><span class="no-results-icon">`);
      Search_x($$renderer2, { size: 48, strokeWidth: 1.5 });
      $$renderer2.push(`<!----></span> <h3>No projects found</h3> <p>Try adjusting your search or filters</p></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(filteredProjects());
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let project = each_array[$$index];
        ProjectCard($$renderer2, { project });
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
