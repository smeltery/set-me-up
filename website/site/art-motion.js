const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const asciiScenes = document.querySelectorAll("[data-ascii-scene]");
const landscapes = [
  ["hero", () => import("./hero-landscape.js").then(module => module.createHeroLandscape)],
  ["cta", () => import("./cta-landscape.js").then(module => module.createCtaLandscape)],
  ["orbit", () => import("./orbit-landscape.js").then(module => module.createOrbitLandscape)],
  ["footer", () => import("./footer-landscape.js").then(module => module.createFooterLandscape)],
].flatMap(([name, load]) => {
  const canvas = document.querySelector(`[data-${name}-landscape]`);
  return canvas ? [{ name, load, canvas, scene: canvas.closest("[data-ascii-scene]") }] : [];
});

const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
const trailHost = document.querySelector("[data-hero-trail]");
let heroTrail;
let trailLoading = false;

function updateHeroTrail() {
  if (!trailHost) return;
  const active = finePointer.matches && !motionPreference.matches && !document.hidden
    && trailHost.closest(".hero").classList.contains("ascii-visible")
    && !document.querySelector(".masthead[data-menu-open], dialog[open]");
  if (active && !heroTrail && !trailLoading) {
    trailLoading = true;
    import("./lab-terminal.js").then(({ mountHeroTrail }) => {
      heroTrail = mountHeroTrail(trailHost);
      updateHeroTrail();
    }).catch(error => {
      console.error("Could not load the ASCII glyph trail.", error);
    }).finally(() => { trailLoading = false; });
  }
  heroTrail?.setRunning(active);
}

finePointer.addEventListener("change", updateHeroTrail);
new MutationObserver(updateHeroTrail).observe(document.body, {
  subtree: true, attributes: true, attributeFilter: ["data-menu-open", "open"],
});

function updateMotion() {
  updateHeroTrail();
  const active = !motionPreference.matches && !document.hidden;
  for (const landscape of landscapes) {
    const visible = landscape.scene.classList.contains("ascii-visible");
    if (visible && !landscape.requested) {
      landscape.requested = true;
      landscape.load().then(create => {
        landscape.renderer = create(landscape.canvas);
        updateMotion();
      }).catch(error => console.error(`Could not load the ASCII ${landscape.name} landscape.`, error));
    }
    landscape.renderer?.setRunning(active && visible);
  }
}

motionPreference.addEventListener("change", updateMotion);
document.addEventListener("visibilitychange", updateMotion);
updateMotion();

const artObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    entry.target.classList.toggle("ascii-visible", entry.intersectionRatio >= .25);
  }
  updateMotion();
}, { threshold: .25 });
asciiScenes.forEach(scene => artObserver.observe(scene));

const featureObserver = new IntersectionObserver(entries => {
  for (const { target, isIntersecting } of entries) {
    if (!isIntersecting) continue;
    featureObserver.unobserve(target);
    import("./lab-terminal.js").then(({ mountFeatureTile }) => {
      mountFeatureTile(target, target.dataset.featureTile);
    }).catch(error => console.error("Could not load the ASCII feature scene.", error));
  }
});
document.querySelectorAll("[data-feature-tile]").forEach(tile => featureObserver.observe(tile));
