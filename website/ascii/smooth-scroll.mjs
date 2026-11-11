/*! Lenis 1.3.27 | MIT | https://github.com/darkroomengineering/lenis */
import Lenis from "lenis";

const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let scroll;

function update() {
  if (reduced.matches) {
    scroll?.destroy();
    scroll = undefined;
    return;
  }
  scroll ??= new Lenis({
    autoRaf: true,
    allowNestedScroll: true,
    anchors: true,
    lerp: .1,
    prevent: element => element.closest(".skip-link, .site-search, .masthead[data-menu-open]"),
  });
  const blocked = document.querySelector(".masthead[data-menu-open], dialog[open]");
  if (blocked) scroll.stop();
  else scroll.start();
}

new MutationObserver(update).observe(document.body, {
  subtree: true,
  attributes: true,
  attributeFilter: ["data-menu-open", "open"],
});
reduced.addEventListener("change", update);
update();
