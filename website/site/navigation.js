const header = document.querySelector(".masthead");
const toggle = header.querySelector(".menu-toggle");
const toggleLabel = toggle.querySelector("span");
const nav = header.querySelector(".site-nav");
const compact = matchMedia("(max-width: 1023px)");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const menuCanvas = header.querySelector("[data-menu-landscape]");
let background = [];
let menuLandscape;
let landscapeLoading = false;
let menuAnimation;
let menuContentAnimation;
let menuClosing = false;
let menuRevision = 0;
let closedMenuBounds;

function menuClip(bounds) {
  return `inset(${bounds.top}px ${Math.max(0, innerWidth - bounds.right)}px ${Math.max(0, innerHeight - bounds.bottom)}px ${bounds.left}px round 28px)`;
}

function updateLandscape() {
  const active = menuIsOpen() && !reducedMotion.matches && !document.hidden;
  if (active && menuCanvas.clientWidth && menuCanvas.clientHeight && !menuLandscape && !landscapeLoading) {
    landscapeLoading = true;
    import("./hero-landscape.js").then(({ createHeroLandscape }) => {
      if (menuIsOpen() && menuCanvas.clientHeight) menuLandscape = createHeroLandscape(menuCanvas);
      landscapeLoading = false;
      menuLandscape?.setRunning(menuIsOpen() && !reducedMotion.matches && !document.hidden);
    }).catch(error => {
      landscapeLoading = false;
      console.error("Could not load the ASCII menu landscape.", error);
    });
  }
  menuLandscape?.setRunning(active && menuCanvas.clientHeight > 0);
}

new ResizeObserver(updateLandscape).observe(menuCanvas);
reducedMotion.addEventListener("change", () => {
  if (menuIsOpen()) {
    menuAnimation?.cancel();
    menuContentAnimation?.cancel();
    if (menuClosing) setMenu(false, true);
  }
  updateLandscape();
});
document.addEventListener("visibilitychange", updateLandscape);

function menuIsOpen() {
  return header.hasAttribute("data-menu-open");
}

function applyMenu(open) {
  if (open === menuIsOpen()) return;
  header.toggleAttribute("data-menu-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  toggleLabel.textContent = open ? "Close" : "Menu";
  if (open) {
    header.setAttribute("role", "dialog");
    header.setAttribute("aria-modal", "true");
    header.setAttribute("aria-labelledby", "mobile-menu-title");
    background = Array.from(document.querySelectorAll("body > main, body > footer, body > .skip-link"))
      .filter(element => !element.inert);
    background.forEach(element => { element.inert = true; });
    toggle.focus({ preventScroll: true });
  } else {
    header.removeAttribute("role");
    header.removeAttribute("aria-modal");
    header.removeAttribute("aria-labelledby");
    background.forEach(element => { element.inert = false; });
    background = [];
  }
  updateLandscape();
}

function setMenu(open, immediate = false) {
  const activeRevision = ++menuRevision;
  menuContentAnimation?.cancel();
  menuClosing = false;
  const animated = compact.matches && !reducedMotion.matches && !immediate;
  if (open && menuIsOpen()) return Promise.resolve();
  if (!open && !menuIsOpen()) return Promise.resolve();
  if (open) applyMenu(true);
  if (!animated) {
    if (!open) applyMenu(false);
    return Promise.resolve();
  }
  menuClosing = !open;
  const hidden = { opacity: 0, transform: 'translateY(-8px) scale(.95)' };
  const visible = { opacity: 1, transform: 'translateY(0) scale(1)' };
  // Match asciicn's Radix popover: animate the panel, never the header.
  menuContentAnimation = nav.animate(open ? [hidden, visible] : [visible, hidden], {
    duration: 100,
    easing: open ? 'ease-out' : 'ease-in',
    fill: 'both',
  });
  return menuContentAnimation.finished.then(() => {
    if (activeRevision !== menuRevision) return;
    if (!open) applyMenu(false);
    menuContentAnimation.cancel();
    menuClosing = false;
  }).catch(error => {
    if (error.name !== 'AbortError') console.error('Could not animate the docs menu.', error);
  });
}

function dismissMenu() {
  setMenu(false);
  toggle.focus({ preventScroll: true });
}

window.addEventListener("site-search-open", () => setMenu(false, true));

header.dataset.menuReady = "";
toggle.hidden = false;

const primaryNav = nav.querySelector(".nav-primary");
let highlightedLink;
const highlight = document.createElement("span");
highlight.className = "nav-highlight";
highlight.setAttribute("aria-hidden", "true");
header.append(highlight);
let highlightGeometry;
let highlightAnimation;

function moveHighlight(selected = highlightedLink) {
  highlightedLink = selected;
  const visible = Boolean(selected) && !compact.matches;
  header.toggleAttribute("data-nav-highlight", visible);
  if (!visible) {
    highlightAnimation?.cancel();
    highlightGeometry = undefined;
    return;
  }
  const bounds = header.getBoundingClientRect();
  const target = selected.getBoundingClientRect();
  const geometry = {
    left: `${target.left - bounds.left - header.clientLeft}px`,
    top: `${target.top - bounds.top - header.clientTop}px`,
    width: `${target.width}px`,
    height: `${target.height}px`,
  };
  if (JSON.stringify(geometry) === JSON.stringify(highlightGeometry)) return;
  const previous = highlightGeometry && highlight.getBoundingClientRect();
  highlightAnimation?.cancel();
  Object.assign(highlight.style, geometry);
  highlightGeometry = geometry;
  if (previous && !reducedMotion.matches) {
    const left = previous.left - bounds.left - header.clientLeft;
    const destination = parseFloat(geometry.left);
    highlightAnimation = highlight.animate([
      { left: `${left}px`, top: `${previous.top - bounds.top - header.clientTop}px`, width: `${previous.width}px`, height: `${previous.height}px` },
      { left: `${left + (destination - left) * .75}px`, width: `${(previous.width * .25 + target.width * .75) * 1.1}px`, offset: .6 },
      geometry,
    ], { duration: 520, easing: "cubic-bezier(.2,.8,.2,1)" });
  }
}


primaryNav.addEventListener("pointerover", event => {
  const link = event.target.closest("a");
  if (link) moveHighlight(link);
});
primaryNav.addEventListener("pointerleave", () => {
  moveHighlight(primaryNav.contains(document.activeElement) ? document.activeElement : null);
});
primaryNav.addEventListener("focusin", event => {
  if (event.target.matches("a")) moveHighlight(event.target);
});
primaryNav.addEventListener("focusout", () => {
  requestAnimationFrame(() => moveHighlight(primaryNav.contains(document.activeElement) ? document.activeElement : null));
});
window.addEventListener("resize", () => moveHighlight());
reducedMotion.addEventListener("change", () => {
  highlightAnimation?.cancel();
  moveHighlight();
});

toggle.addEventListener("click", () => {
  if (menuClosing) setMenu(true);
  else if (menuIsOpen()) dismissMenu();
  else if (compact.matches) setMenu(true);
});

header.addEventListener("click", event => {
  const link = event.target.closest("a");
  if (!menuIsOpen() || !link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  setMenu(false, true);


});

compact.addEventListener("change", () => {
  if (compact.matches || !menuIsOpen()) return;
  setMenu(false, true);
  if (document.activeElement === toggle) nav.querySelector("a").focus({ preventScroll: true });
});

header.addEventListener("keydown", event => {
  if (!menuIsOpen()) return;
  if (event.key === "Escape") {
    event.preventDefault();
    dismissMenu();
  }
  if (event.key === "Tab") {
    const focusable = [...header.querySelectorAll("a, button")].filter(element => element.getClientRects().length && !element.hidden);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
