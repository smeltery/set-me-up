import { mount } from 'ascii-rest/mount.ts';

const pieces = {
  apple: () => import('ascii-rest/pieces/apple.ts'),
  tux: () => import('ascii-rest/pieces/tux.ts'),
  debian: () => import('ascii-rest/pieces/debian.ts'),
  ubuntu: () => import('ascii-rest/pieces/ubuntu.ts'),
  'arch-linux': () => import('ascii-rest/pieces/arch-linux.ts'),
  nixos: () => import('ascii-rest/pieces/nixos.ts'),
  'misty-forest': () => import('ascii-rest/pieces/misty-forest.ts'),
  'jungle-falls': () => import('ascii-rest/pieces/jungle-falls.ts'),
  'alpine-dawn': () => import('ascii-rest/pieces/alpine-dawn.ts'),
  'file-tree': () => import('ascii-rest/pieces/file-tree.ts'),
};
const stops = new Map<HTMLElement, () => void>();
const revisions = new WeakMap<HTMLElement, number>();
const started = new Set<HTMLElement>();
const motion = matchMedia('(prefers-reduced-motion: reduce)');

// Preserve recognizable logo colors and lightly tint the landscapes toward the brand palette.
function forestInk(hex: string, logo = false) {
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  let light = (.2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2]) / 255;
  if (logo && light > 0) light = .35 + .65 * Math.sqrt(light);
  const low = logo ? [32, 60, 44] : [20, 35, 27];
  const high = logo ? [53, 83, 55] : [239, 236, 172];
  return '#' + low.map((v, i) => Math.round(v + (high[i] - v) * light).toString(16).padStart(2, '0')).join('');
}
function sceneInk(hex: string) {
  const forest = forestInk(hex);
  return '#' + [1, 3, 5].map(i => {
    const native = parseInt(hex.slice(i, i + 2), 16);
    const tint = parseInt(forest.slice(i, i + 2), 16);
    return Math.round(native * .85 + tint * .15).toString(16).padStart(2, '0');
  }).join('');
}
async function play(element: HTMLElement) {
  const name = element.dataset.asciiRest as keyof typeof pieces;
  const revision = (revisions.get(element) ?? 0) + 1;
  revisions.set(element, revision);
  stops.get(element)?.();
  try {
    if (!pieces[name]) throw new Error(`Unknown ASCII piece: ${name}`);
    const source = await pieces[name]();
    if (revisions.get(element) !== revision) return;
    const piece = { ...source, meta: { ...source.meta, ground: element.dataset.asciiLogo ? undefined : '#14231b', palette: source.meta.palette?.map(hex => element.dataset.asciiLogo ? hex : sceneInk(hex)) } };
    if (name === 'file-tree') {
      piece.meta = { ...piece.meta, rows: 11 };
      piece.default = options => {
        const frame = source.default(options);
        return (time, environment) => frame(time, environment).split('\n').slice(0, 11).join('\n').trimEnd();
      };
    }
    const options = name === 'file-tree' ? { root: '~/blueprint', entries: 'smu.toml\ndotfiles/\n  rcrc\n  modules/\n    example/\n      install.sh\n  tag-work/\n    gitconfig\nREADME.md' } : {};
    stops.set(element, mount(element, piece, { ...options, fps: element.dataset.asciiLogo ? 12 : 15 }));
    element.dataset.ready = '';
  } catch (error) {
    console.error(`Could not render ${name}`, error);
    element.dataset.failed = '';
  }
}
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    started.add(entry.target as HTMLElement);
    play(entry.target as HTMLElement);
    observer.unobserve(entry.target);
  }
}, { rootMargin: '160px' });
for (const element of document.querySelectorAll<HTMLElement>('[data-ascii-rest]')) observer.observe(element);
motion.addEventListener('change', () => { for (const element of started) play(element); });
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-forest-scene]')) {
  button.addEventListener('click', () => {
    const canvas = document.querySelector<HTMLElement>('[data-forest-gallery]');
    if (!canvas) return;
    for (const choice of document.querySelectorAll('[data-forest-scene]')) choice.setAttribute('aria-pressed', String(choice === button));
    canvas.dataset.asciiRest = button.dataset.forestScene;
    canvas.setAttribute('aria-label', `${button.textContent?.trim()} ASCII landscape`);
    play(canvas);
  });
}
