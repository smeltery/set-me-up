const dialog = document.querySelector(".site-search");
const input = dialog.querySelector("input");
const list = dialog.querySelector(".search-results");
const status = dialog.querySelector("[role=status]");
const close = dialog.querySelector(".search-close");
const empty = dialog.querySelector(".search-empty");
const preview = dialog.querySelector(".search-preview");
const icon = dialog.querySelector("#search-document-icon");
const docs = dialog.dataset.docsUrl;
const triggers = Array.from(document.querySelectorAll("[data-search-open]"));
const popular = ["/docs/quick-start", "/docs/guides/blueprints", "/docs/guides/modules",
  "/docs/guides/vps", "/docs/guides/troubleshooting", "/docs/reference/cli"];
let index;
let loading;
let opener;
let active = 0;
let displayedResults = [];

function rankPages(query) {
  const terms = query.toLowerCase().match(/[\p{L}\p{N}_/-]+/gu) ?? [];
  if (!terms.length) return popular.flatMap(path => {
    const page = index.find(item => item.path === path);
    return page ? [{ ...page, href: page.path }] : [];
  });
  return index.flatMap(page => {
    const title = page.title.toLowerCase();
    const description = page.description.toLowerCase();
    const sections = page.sections.map(section => ({
      ...section,
      score: terms.reduce((score, term) => score + (section.title.toLowerCase().includes(term) ? 8 : 0)
        + (section.text.toLowerCase().includes(term) ? 2 : 0), 0),
    })).sort((a, b) => b.score - a.score);
    const text = [title, description, ...sections.map(section => section.text.toLowerCase())].join(" ");
    if (!terms.every(term => text.includes(term))) return [];
    const titleMatch = terms.every(term => title.includes(term));
    const section = sections[0];
    return [{
      ...page,
      href: page.path + (!titleMatch && section?.score ? "#" + section.id : ""),
      score: terms.reduce((score, term) => score + (title.includes(term) ? 20 : 0)
        + (description.includes(term) ? 5 : 0), section?.score ?? 0),
    }];
  }).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, 8);
}

function selectResult(index, scroll = true) {
  const links = Array.from(list.querySelectorAll("a"));
  active = Math.max(0, Math.min(index, links.length - 1));
  links.forEach((link, position) => link.setAttribute("aria-selected", String(position === active)));
  const selected = links[active];
  if (selected) {
    input.setAttribute("aria-activedescendant", selected.id);
    if (scroll) selected.scrollIntoView({ block: "nearest", behavior: "instant" });
    const result = displayedResults[active];
    preview.querySelector(".search-preview-group").textContent = result.group;
    preview.querySelector(".search-preview-title").textContent = result.title;
    preview.querySelector(".search-preview-description").textContent = result.description;
    preview.querySelector("a").href = selected.href;
  } else {
    input.removeAttribute("aria-activedescendant");
  }
}

function render() {
  if (!index) return;
  const results = rankPages(input.value);
  const groups = new Map();
  for (const result of results) {
    if (!groups.has(result.group)) groups.set(result.group, []);
    groups.get(result.group).push(result);
  }
  displayedResults = Array.from(groups.values()).flat();
  list.replaceChildren();
  let position = 0;
  for (const [name, entries] of groups) {
    const group = document.createElement("div");
    group.role = "group";
    group.setAttribute("aria-label", name);
    const heading = document.createElement("h3");
    heading.className = "search-group-title";
    heading.textContent = name;
    group.append(heading);
    for (const result of entries) {
      const link = document.createElement("a");
      link.id = "doc-result-" + position;
      link.href = new URL(result.href, docs).href;
      link.role = "option";
      link.tabIndex = -1;
      const label = document.createElement("span");
      label.className = "search-result-title";
      label.textContent = result.title;
      const hint = document.createElement("span");
      hint.className = "search-result-key";
      hint.textContent = "↵";
      hint.setAttribute("aria-hidden", "true");
      const selectedPosition = position++;
      link.addEventListener("pointerenter", () => selectResult(selectedPosition, false));
      link.setAttribute("aria-label", result.title + " — external docs site");
      link.append(icon.content.cloneNode(true), label, hint);
      group.append(link);
    }
    list.append(group);
  }
  preview.hidden = results.length === 0;
  empty.hidden = results.length > 0;
  empty.textContent = results.length ? "" : `No results for “${input.value.trim()}”. Try “dotfiles”, “VPS”, or “Nix”.`;
  status.textContent = results.length ? (input.value.trim() ? `${results.length} results` : "Popular guides")
    : `No results for “${input.value.trim()}”. Try “dotfiles”, “VPS”, or “Nix”.`;
  selectResult(0);
}

async function openSearch(trigger) {
  if (dialog.open) return;
  opener = trigger;
  window.dispatchEvent(new Event("site-search-open"));
  input.value = "";
  list.replaceChildren();
  input.removeAttribute("aria-activedescendant");
  dialog.showModal();
  input.focus();
  displayedResults = [];
  preview.hidden = true;
  empty.hidden = false;
  empty.textContent = "Loading documentation…";
  status.textContent = empty.textContent;
  if (!index) {
    loading ??= fetch("/docs-search.json").then(response => {
      if (!response.ok) throw new Error(`Search index returned HTTP ${response.status}.`);
      return response.json();
    });
    try {
      index = await loading;
    } catch (error) {
      loading = undefined;
      empty.textContent = "Search could not load. Close and reopen to retry, or open the docs below.";
      status.textContent = empty.textContent;
      console.error("Could not load documentation search.", error);
      return;
    }
  }
  render();
}

input.addEventListener("input", render);
dialog.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    event.preventDefault();
    dialog.close();
    return;
  }
  const links = list.querySelectorAll('a[role="option"]');
  const count = links.length;
  if (document.activeElement !== input) return;
  if ((event.key === "ArrowDown" || event.key === "ArrowUp") && count) {
    event.preventDefault();
    selectResult((active + (event.key === "ArrowDown" ? 1 : -1) + count) % count);
  }
  if (event.key === "Enter" && count) {
    event.preventDefault();
    links[active].click();
  }
});
close.addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  const target = opener?.getClientRects().length ? opener : triggers.find(trigger => trigger.getClientRects().length);
  target?.focus({ preventScroll: true });
});
dialog.addEventListener("click", event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
window.addEventListener("keydown", event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    if (dialog.open) dialog.close();
    else openSearch(document.activeElement);
  }
  if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey &&
      !event.target.closest('input, textarea, select, [contenteditable="true"]') && !dialog.open) {
    event.preventDefault();
    openSearch(document.activeElement);
  }
});
for (const trigger of triggers) {
  trigger.hidden = false;
  trigger.addEventListener("click", () => openSearch(trigger));
}
