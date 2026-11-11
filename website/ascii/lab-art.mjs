export const labPaper = "#192818";

const ink = {
  sky: [37, 58, 112],
  haze: [57, 84, 150],
  star: [151, 173, 233],
  far: [51, 73, 132],
  ridge: [86, 112, 177],
  ground: [51, 71, 123],
  steel: [151, 176, 235],
  ice: [215, 230, 255],
  signal: [146, 205, 248],
  ready: [140, 225, 208],
};
const textures = ["·", "╱", "╲", "░", "┊", "─", "∙", "·"];

const station = [
  "       ╎",
  "     ╲ ╎ ╱",
  "      ╲╋╱",
  "       ║",
  "    ▄▄▄╩▄▄▄",
  "  ▄▀▓░░░░░▓▀▄",
  "  █ ░╔═══╗░ █",
  "  █ ░║ + ║░ █",
  "╺━┻━━╩═══╩━━┻━╸",
];

const machines = {
  macos: [
    "╭─────────────╮",
    "│ ╔═════════╗ │",
    "│ ║ >_      ║ │",
    "│ ║ ─────   ║ │",
    "│ ╚═════════╝ │",
    "╰──────┬──────╯",
    "     ▄▄┴▄▄",
    "╺━━━━━━━━━━━━━╸",
  ],
  linux: [
    "╭─────────╮",
    "│ ▓▓▓▓▓▓▓ │",
    "│ ──────∙ │",
    "│ ──────∙ │",
    "│ ░░░░░░░ │",
    "│ ░░░░░░░ │",
    "╰┬───────┬╯",
    "╺┻━━━━━━━┻╸",
  ],
  vps: [
    "╔═════════════╗",
    "║ ━━━━━━ ● ●  ║",
    "╠═════════════╣",
    "║ ━━━━━━ ● ●  ║",
    "╠═════════════╣",
    "║ ━━━━━━ ● ●  ║",
    "╚═════════════╝",
    "╺━━━━━━━━━━━━━╸",
  ],
};

function grain(x, y) {
  return ((Math.imul(x + 71, 374761393) ^ Math.imul(y + 43, 668265263)) >>> 0) % 97 / 97;
}

function drawTerrain(frame, time, ground) {
  const { columns, rows } = frame;
  const cloudShift = Math.floor(time * 2.5);
  const moonX = Math.round(columns * .68);
  const moonY = Math.round(rows * .24);
  for (let x = 0; x < columns; x += 1) {
    const position = x / columns;
    const far = ground - Math.round(rows * (.29 - .19 * Math.exp(-((position - .5) ** 2) / .025)
      + .055 * Math.cos(position * 47) + .02 * Math.cos(position * 109)));
    const near = ground - Math.round(rows * (.08 + .07 * Math.cos(position * 19) ** 2));
    for (let y = 0; y < rows; y += 1) {
      const noise = grain(x, y);
      const depth = (y - ground) / rows;
      const pattern = textures[Math.floor(noise * textures.length)];
      const moonDistance = Math.hypot((x - moonX) * .55, y - moonY);
      if (y >= ground) {
        const flow = Math.sin(x * .22 + y * 1.6 - time * 2);
        const reflection = Math.abs(position - .68) < .09 && flow > .86;
        frame.put(x, y, flow > .86 ? "─" : pattern, reflection ? ink.haze : depth > .22 ? ink.sky : ink.ground);
      } else if (y >= near || y >= far) {
        const edge = y === far || y === near;
        frame.put(x, y, edge ? "╌" : pattern, edge || (y >= near && noise > .7) ? ink.ridge : ink.far);
      } else if (moonDistance < 2.6) {
        frame.put(x, y, moonDistance < 1.8 ? "▓" : "▒", ink.ice);
      } else if (moonDistance < 5.3) {
        frame.put(x, y, moonDistance < 3.4 ? "░" : "·", moonDistance < 3.4 ? ink.star : ink.haze);
      } else if (noise > .973) {
        frame.put(x, y, (x + y + Math.floor(time * 2)) % 5 === 0 ? "✧" : "·", ink.star);
      } else {
        const cloud = Math.sin((x - cloudShift) * .11 + y * .28) + Math.cos(y * .85 - x * .035);
        if (cloud > .35 || noise > .65) frame.put(x, y, cloud > 1 ? "─" : "·", cloud > 1.6 ? ink.haze : ink.sky);
      }
    }
  }
}

function drawStructure(frame, art, center, floor, active) {
  const width = Math.max(...art.map(line => line.length));
  const left = center - Math.floor(width / 2);
  const top = floor - art.length + 1;
  art.forEach((line, row) => {
    for (const [column, glyph] of Array.from(line).entries()) {
      if (glyph === " " && (row < 3 || column < 2 || column >= width - 2)) continue;
      const lit = "●+>_╋∙".includes(glyph);
      frame.put(left + column, top + row, glyph, lit && active ? ink.ready : lit ? ink.signal : ink.steel);
    }
  });
}

export function drawLabArt(frame, { stage = "discover", profile = "macos", state = "ready" } = {}, time = 0) {
  frame.clear();
  const { columns, rows } = frame;
  const ground = Math.round(rows * .68);
  const left = Math.round(columns * .23);
  const right = Math.round(columns * .77);
  const done = state === "done";
  drawTerrain(frame, time, ground);
  drawStructure(frame, station, left, ground, done || stage === "discover");
  drawStructure(frame, machines[profile] ?? machines.macos, right, ground, done);
  const start = left + 9;
  const end = right - 9;
  const length = Math.max(1, end - start);
  const pulse = Math.floor(time * (stage === "apply" ? 22 : 12)) % length;
  const route = stage === "discover" && !done ? "·" : "╌";
  for (let x = start; x <= end; x += 1) {
    const offset = x - start;
    const y = ground + 1 + Math.round(2 * Math.sin(Math.PI * offset / length));
    const distance = Math.abs(offset - (stage === "maintain" ? length - pulse : pulse));
    const live = distance < (stage === "apply" ? 4 : 2);
    frame.put(x, y, live ? (stage === "maintain" ? "‹" : "›") : route, live ? ink.signal : ink.steel);
  }

  if (stage === "discover") {
    const sweep = Math.floor(time * 4) % 8;
    frame.write(left - 3 - sweep, ground - station.length - 1 - Math.floor(sweep / 2),
      "· ◇ ·", ink.signal);
  }
  if (stage === "preview") {
    const mark = done ? "+" : "?";
    frame.write(Math.round((left + right) / 2) - 2, ground - 3, `[ ${mark} ]`, ink.signal);
  }
  if (stage === "apply" || stage === "maintain") {
    const progress = done ? 7 : Math.floor(time * 5) % 7;
    frame.write(right - 4, ground - 10, `[${"■".repeat(progress)}${"·".repeat(7 - progress)}]`, done ? ink.ready : ink.signal);
  }

  frame.write(4, 3, `> ${stage.toUpperCase()}`, ink.ice);
  frame.write(columns - 12, 3, done ? "[ OK ]" : "[ READY ]", done ? ink.ready : ink.steel);
}
