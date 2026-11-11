import { highlightCommand, highlightTranscript } from "./syntax.js";

const profiles = {
  macos: {
    machine: "macOS workstation",
    guide: ["/docs/quick-start", "macOS quick start"],
    bucket: "macos",
    module: "terminal/alacritty  [script]",
    target: "base",
    plan: "smu plan",
    apply: "smu --provision --module base",
    applied: "base module provisioned in this example",
  },
  linux: {
    machine: "Linux desktop · Debian example",
    guide: ["/docs/guides/machine-profiles", "Linux machine profiles"],
    bucket: "debian",
    module: "browsers/chrome     [packages]",
    target: "base",
    plan: "smu plan",
    apply: "smu --provision --module base",
    applied: "base module provisioned in this example",
  },
  vps: {
    machine: "Headless VPS · Debian/Ubuntu",
    guide: ["/docs/guides/vps", "Headless VPS guide"],
    bucket: "debian",
    module: "server/headless      [packages]",
    target: "server/headless",
    plan: "smu plan --machine vps",
    apply: "smu --setup-profile vps",
    applied: "server/headless provisioned in this example",
    applyDescription: "Try applying the headless VPS profile from the reviewed plan.",
    applyCheck: "Run smu status or smu doctor afterward. Review service and package changes before continuing on a production host.",
  },
};

const stages = {
  discover: {
    label: "Discover",
    title: "Discover available modules.",
    guide: ["/docs/guides/modules", "Modules guide"],
    description: "Find the modules available for this machine and your shared setup.",
    check: profile => `Match the module IDs to your blueprint. This walkthrough will apply ${profile.target} in step three.`,
    command: () => "smu --list-modules",
    output: profile => [
      `${profile.bucket}/`,
      `  ${profile.module}`,
      "universal/",
      "  base                [script]",
      `Showing ${profile.bucket} + universal.`,
    ],
    complete: "Module inventory ready. Next, preview what the blueprint would apply.",
  },
  preview: {
    label: "Preview",
    title: "Preview your setup.",
    description: "See what would change before installing anything.",
    check: "Check the blueprint and adapter first. Resolve any file conflicts or trust warnings before running a command that writes.",
    command: profile => profile.plan,
    output: profile => [
      "Blueprint      personal/dotfiles",
      "Adapter        rcm",
      `Selected       ${profile.target}`,
      "Conflicts      none in this example",
      "Writes         none (plan only)",
    ],
    complete: "Example plan reviewed. The next command would write changes in a real shell.",
  },
  apply: {
    label: "Apply",
    title: "Apply the reviewed setup.",
    description: profile => profile.applyDescription
      ?? "Try applying the base module from the reviewed plan.",
    check: profile => profile.applyCheck
      ?? "Run smu status afterward to inspect detectable module state. A shell module without a detection marker can report unknown.",
    command: profile => profile.apply,
    output: profile => [
      "Plan           reviewed for this example",
      `Selected       ${profile.target}`,
      `Outcome        ${profile.applied}`,
      "Follow-up      run smu status",
      "Browser        no system changes made",
    ],
    risk: "Writes in a real shell",
    complete: "Example setup applied. Your machine was untouched. Next, preview a routine update.",
  },
  maintain: {
    label: "Maintain",
    title: "Keep your setup current.",
    guide: ["/docs/guides/updates", "Updates and rollback guide"],
    description: "Check for changes to your blueprint, installer, and modules.",
    check: "Review the refs and check for local edits. Resolve dirty or diverged checkouts before applying the update.",
    command: () => "smu update --all --dry-run",
    output: () => [
      "Blueprint      incoming commits to review",
      "Installer      already current in this example",
      "Modules        review changed submodule refs",
      "Worktree       clean in this example",
      "Writes         none (dry run)",
    ],
    complete: "Example update reviewed. The walkthrough is complete. Replay it or choose another machine.",
  },
};

const lab = document.querySelector(".setup-lab");
const command = lab.querySelector("#command");
const detail = lab.querySelector("#command-detail");
const output = lab.querySelector("#transcript-output");
const terminalContainer = lab.querySelector(".lab-terminal");
const transcriptState = lab.querySelector("#transcript-state");
const copy = lab.querySelector("#copy-command");
const run = lab.querySelector("#run-demo");
const runLabel = lab.querySelector("#run-label");
const previous = lab.querySelector("#previous-demo");
const status = lab.querySelector("#demo-status");
const guide = lab.querySelector("#profile-guide");
const guideLabel = lab.querySelector("#guide-label");
const stepTitle = lab.querySelector("#step-title");
const stepProgress = lab.querySelector("#step-progress");
const stepCheck = lab.querySelector("#step-check");
const commandRisk = lab.querySelector("#command-risk");
const stageKeys = Object.keys(stages);
const completed = Object.fromEntries(Object.keys(profiles).map(key => [key, new Set()]));

let revision = 0;
let terminal;
let terminalModule;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let autoplay = !reducedMotion.matches;
let inView = false;
let stepTimer;

function isPlaying() {
  return autoplay && inView && !document.hidden;
}

function updatePlayLabel() {
  runLabel.textContent = autoplay ? "Pause demo" : "Play demo";
  run.setAttribute("aria-pressed", String(autoplay));
  run.lastElementChild.textContent = autoplay ? "Ⅱ" : "▸";
  lab.dataset.playing = String(isPlaying());
}

function scheduleNext() {
  clearTimeout(stepTimer);
  if (!isPlaying()) return;
  stepTimer = setTimeout(() => {
    if (!isPlaying()) return;
    transitionNext();
  }, selection().index === stageKeys.length - 1 ? 4500 : 3200);
}

async function transitionNext() {
  const activeRevision = revision;
  const panels = Array.from(lab.querySelectorAll(".lab-copy, .transcript"));
  const animate = !reducedMotion.matches;
  const outgoing = animate ? panels.map(panel => panel.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: 220, easing: "ease-in", fill: "forwards" },
  )) : [];
  try {
    await Promise.all(outgoing.map(animation => animation.finished));
    if (activeRevision !== revision || !isPlaying()) return;
    const { machineKey, index } = selection();
    const following = stageKeys[index + 1];
    if (!following) completed[machineKey].clear();
    lab.querySelector(`[name="stage"][value="${following ?? stageKeys[0]}"]`).checked = true;
    showSelection();
    playStep();
    // Let React mount the next terminal while the previous frame is faded out.
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  } catch (error) {
    if (error.name !== "AbortError") console.error("Could not transition the setup demo.", error);
    return;
  } finally {
    outgoing.forEach(animation => animation.cancel());
  }
  if (animate && isPlaying()) {
    panels.forEach(panel => panel.animate(
      [{ opacity: 0, transform: "translateY(3px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: 440, easing: "cubic-bezier(.2,.7,.2,1)" },
    ));
  }
}

function syncPlayback() {
  clearTimeout(stepTimer);
  updatePlayLabel();
  terminal?.setPaused(!isPlaying());
  if (!isPlaying()) {
    for (const panel of lab.querySelectorAll(".lab-copy, .transcript")) {
      panel.getAnimations().forEach(animation => animation.cancel());
    }
    return;
  }
  if (lab.dataset.state === "done") scheduleNext();
  else if (lab.dataset.state !== "running") playStep();
}

function pauseDemo() {
  autoplay = false;
  syncPlayback();
}

function playStep() {
  const current = selection();
  const activeRevision = revision;
  setState("running");
  transcriptState.textContent = "Running example…";
  output.textContent = "Reading example blueprint…";
  status.textContent = "";
  const finish = () => {
    if (activeRevision !== revision) return;
    completed[current.machineKey].add(current.stageKey);
    showTranscript(current);
    updateProgress(current);
    status.textContent = current.stage.complete;
    scheduleNext();
  };
  if (reducedMotion.matches) {
    finish();
    return;
  }
  loadTerminal().then(renderer => {
    if (activeRevision !== revision) return;
    if (!renderer) {
      finish();
      return;
    }
    renderer.setPaused(!isPlaying());
    renderer.play(current.stage.command(current.profile), current.stage.output(current.profile), current.stageKey === "apply", finish);
  });
}

function loadTerminal() {
  terminalModule ??= import("./lab-terminal.js").then(({ createLabTerminal }) => {
    terminal = createLabTerminal(terminalContainer);
    const current = selection();
    updateProgress(current);
    return terminal;
  }).catch(error => {
    console.error("Could not load the ASCII terminal.", error);
  });
  return terminalModule;
}

function selection() {
  const machineKey = lab.querySelector('[name="machine"]:checked').value;
  const stageKey = lab.querySelector('[name="stage"]:checked').value;
  return {
    machineKey,
    stageKey,
    profile: profiles[machineKey],
    stage: stages[stageKey],
    index: stageKeys.indexOf(stageKey),
  };
}

function setState(state) {
  lab.dataset.state = state;
  updatePlayLabel();
}

function showTranscript(current) {
  highlightTranscript(output, current.stage.output(current.profile));
  transcriptState.textContent = "Example result";
  setState("done");
}

function updateProgress(current) {
  const { machineKey, index } = current;
  const seen = completed[machineKey];
  stepProgress.textContent = `Step ${index + 1} of ${stageKeys.length}`;
  previous.hidden = index === 0;
  for (const input of lab.querySelectorAll('[name="stage"]')) {
    input.parentElement.toggleAttribute("data-completed", seen.has(input.value));
  }
}

function showSelection() {
  clearTimeout(stepTimer);
  revision += 1;
  terminal?.clear();
  const current = selection();
  const { machineKey, stageKey, profile, stage } = current;
  lab.dataset.profile = machineKey;
  lab.dataset.stage = stageKey;
  stepTitle.textContent = stage.title;
  detail.textContent = typeof stage.description === "function" ? stage.description(profile) : stage.description;
  stepCheck.textContent = typeof stage.check === "function" ? stage.check(profile) : stage.check;
  commandRisk.textContent = stage.risk ?? "Read-only";
  commandRisk.classList.toggle("risk-write", Boolean(stage.risk));
  highlightCommand(command, stage.command(profile));
  const [guidePath, label] = stage.guide ?? profile.guide;
  guide.href = new URL(guidePath, lab.dataset.docsUrl);
  guideLabel.textContent = label;
  status.textContent = "";
  updateProgress(current);

  if (completed[machineKey].has(stageKey)) {
    showTranscript(current);
  } else {
    output.textContent = "Run the example to see the result.";
    transcriptState.textContent = "Ready";
    setState("ready");
  }
}

lab.addEventListener("change", () => {
  pauseDemo();
  showSelection();
});
lab.querySelector(".lab-check").addEventListener("toggle", event => {
  if (event.target.open) pauseDemo();
});
window.addEventListener("site-search-open", pauseDemo);
document.addEventListener("visibilitychange", syncPlayback);
reducedMotion.addEventListener("change", () => {
  pauseDemo();
  if (lab.dataset.state === "running" && reducedMotion.matches) {
    revision += 1;
    terminal?.clear();
    showTranscript(selection());
  }
});
window.addEventListener("pageshow", event => {
  if (event.persisted) showSelection();
});

run.addEventListener("click", () => {
  autoplay = !autoplay;
  syncPlayback();
});

previous.addEventListener("click", () => {
  pauseDemo();
  const { index } = selection();
  if (!index) return;
  lab.querySelector(`[name="stage"][value="${stageKeys[index - 1]}"]`).checked = true;
  showSelection();
});

copy.addEventListener("click", async () => {
  pauseDemo();
  const activeRevision = revision;
  try {
    await navigator.clipboard.writeText(command.textContent);
    if (revision === activeRevision) status.textContent = "Command copied.";
  } catch {
    if (revision !== activeRevision) return;
    const range = document.createRange();
    range.selectNodeContents(command);
    const selectedText = window.getSelection();
    selectedText.removeAllRanges();
    selectedText.addRange(range);
    status.textContent = "Clipboard unavailable. Copy the selected command manually.";
  }
});

for (const link of document.querySelectorAll("[data-lab-machine]")) {
  link.addEventListener("click", event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    pauseDemo();
    const machine = link.dataset.labMachine;
    lab.querySelector(`[name="machine"][value="${machine}"]`).checked = true;
    lab.querySelector('[name="stage"][value="discover"]').checked = true;
    showSelection();
  });
}

showSelection();

const terminalObserver = new IntersectionObserver(entries => {
  inView = entries.some(entry => entry.isIntersecting);
  syncPlayback();
}, { threshold: .35 });
terminalObserver.observe(lab.querySelector(".lab-grid"));

const fieldNotes = document.querySelector(".faq-list");

function openLinkedNote() {
  const note = document.getElementById(location.hash.slice(1));
  if (note instanceof HTMLDetailsElement && fieldNotes.contains(note)) note.open = true;
}

window.addEventListener("hashchange", openLinkedNote);
openLinkedNote();
for (const example of document.querySelectorAll(".plate-command code")) {
  highlightCommand(example, example.textContent);
}
lab.querySelectorAll(".lab-picker").forEach(picker => { picker.hidden = false; });
copy.hidden = false;
run.hidden = false;
