import postcss from "postcss";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
let output = "/* Scoped marketing content; the shared asciicn shell owns global UI. */\n";
for (const name of ["style.css", "shell.css", "explore.css", "ascii-rest.css"]) {
 const sheet = postcss.parse(await readFile(`${root}site/${name}`, "utf8"));
 sheet.walkRules(rule => {
  if (rule.parent.type === "atrule" && rule.parent.name.endsWith("keyframes")) return;
  rule.selectors = rule.selectors.map(selector => {
   if (selector.startsWith(":root")) return selector.replace(":root", ".marketing-content");
   if (selector.startsWith("body")) return selector.replace(/^body/, ".marketing-content");
   return `.marketing-content ${selector}`;
  });
 });
 output += sheet.toString() + "\n";
}
output += `
.dark .marketing-content { --ink: #e5ebe1; --frost: #09110d; --cobalt: #bed08f; --slate: #afbea6; --line: #2b4030; --canopy-wash: linear-gradient(125deg,#1d2c1f,#101b14 75%); --highlight-wash: #203024; }
.marketing-content :is(.hero,.cta-section,.orbit-section,.site-footer) { --ink: #14231b; --frost: #f7f6ef; --cobalt: #456449; --slate: #b8c6ae; }
.dark .marketing-content .faq-list summary:is(:hover), .dark .marketing-content .faq-list details[open] summary { background: var(--highlight-wash); }
.dark .marketing-content .faq-list summary::after { background: #31452d; color: #d7dfb2; }
.dark .marketing-content .guide-link:hover, .dark .marketing-content .platform-guide:hover { background: #2b4030; color: #d7dfb2; }
.dark .marketing-content .plate-command .syntax-command { color: #c3d391; }
.dark .marketing-content .plate-command .syntax-flag { color: #d5b5dc; }
.marketing-content { --sans: var(--font-sans); --mono: var(--font-mono); }
.marketing-content .hero { min-height: 100svh; margin-top: calc(-1 * var(--header-height)); padding-top: calc(var(--header-height) + clamp(2rem, 5vh, 4rem)); padding-bottom: clamp(3rem, 8vh, 6rem); display: flex; align-items: center; }
.marketing-content .hero-content { padding-top: 0; padding-bottom: 0; }
.marketing-content .hero > .landscape { inset: 0; width: 100%; height: 100%; }
.marketing-content .native-landscape { opacity: 1; }
.marketing-content .hero:has(.native-landscape) > img, .marketing-content .cta-section:has(.native-landscape) > img, .marketing-content .orbit-art:has(.native-landscape) > img { display: none; }
.marketing-content .orbit-art > .native-landscape { position: absolute; inset: 0; }
.marketing-content .lab-grid { min-height: 21rem; }
.marketing-content .lab-terminal { padding-bottom: 0; }
.marketing-content .smu-terminal-title { display: inline-flex; align-items: baseline; gap: 1ch; }
.marketing-content .smu-terminal-lights { display: inline-flex; gap: .16ch; letter-spacing: 0; padding-inline: .5ch; }
.marketing-content .setup-terminal { width: 100%; }
.marketing-content .setup-terminal > * { width: 100%; }
.marketing-content .launch-command button { cursor: pointer; }
.marketing-content .forest-scenes button { cursor: pointer; }
@media(max-width: 700px) { .marketing-content .hero { padding-top: calc(var(--header-height) + 2.5rem); } .marketing-content .hero > .landscape { top: 0; height: 100%; min-height: 100%; } .marketing-content .lab-grid { min-height: 0; } }
`;
await writeFile(`${root}styles/marketing.css`, output);
