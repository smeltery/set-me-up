import { highlightCommand } from "./syntax.js";

const copyFeedbackTimers = new WeakMap();

function showCopyConfirmation(label, copiedText, originalText) {
  clearTimeout(copyFeedbackTimers.get(label));
  label.textContent = copiedText;
  copyFeedbackTimers.set(label, setTimeout(() => {
    label.textContent = originalText;
    copyFeedbackTimers.delete(label);
  }, 2000));
}

const terminals = new IntersectionObserver(entries => {
  for (const { target, isIntersecting } of entries) {
    if (!isIntersecting) continue;
    terminals.unobserve(target);
    import("./lab-terminal.js").then(({ mountSetupTerminal }) => {
      const mount = () => mountSetupTerminal(
        target.querySelector(".setup-terminal"),
        target.querySelector(".setup-shell-content"),
      );
      // Keep a focused tab or copy button in place until the visitor leaves the shell.
      if (target.matches(":focus-within")) {
        const onFocusOut = event => {
          if (target.contains(event.relatedTarget)) return;
          target.removeEventListener("focusout", onFocusOut);
          mount();
        };
        target.addEventListener("focusout", onFocusOut);
      } else {
        mount();
      }
    }).catch(error => console.error("Could not load the setup terminal.", error));
  }
});

for (const panel of document.querySelectorAll("[data-command-panel]")) {
  const picker = panel.querySelector(".launch-picker");
  const command = panel.querySelector(".launch-command code");
  const copy = panel.querySelector(".launch-command button");
  const guide = panel.querySelector(".launch-guide");
  const guideLabel = guide.querySelector("span");
  const note = panel.querySelector(".hero-console-note");
  const status = panel.querySelector(".launch-status");
  const defaultCommand = command.textContent;
  const agentCopy = panel.querySelector("[data-copy-agent-prompt]");
  const agentFallback = panel.querySelector(".agent-prompt-fallback");

  function updateSelection() {
    const selected = picker.querySelector(":checked");
    highlightCommand(command, selected.dataset.command ?? defaultCommand);
    guide.href = selected.dataset.guide;
    guideLabel.textContent = selected.dataset.label;
    if (note) note.textContent = selected.dataset.note;
    status.textContent = "";
    copy.textContent = "Copy";
    agentCopy.querySelector("span").textContent = "Copy agent prompt";
    agentFallback.hidden = true;
  }

  picker.addEventListener("change", updateSelection);
  window.addEventListener("pageshow", event => {
    if (event.persisted) updateSelection();
  });
  copy.addEventListener("click", () => {
    const selected = picker.querySelector(":checked");
    copyCommand(command, copy, status, () => picker.querySelector(":checked") === selected);
  });


  updateSelection();
  picker.hidden = false;
  copy.hidden = false;
  terminals.observe(panel.querySelector(".setup-shell"));
}

for (const panel of document.querySelectorAll("[data-command-panel], [data-agent-prompt-panel]")) {
  const picker = panel.querySelector(".launch-picker");
  const agentCopy = panel.querySelector("[data-copy-agent-prompt]");
  const agentFallback = panel.querySelector(".agent-prompt-fallback");
  const agentText = agentFallback.querySelector("pre");
  const status = panel.querySelector(".launch-status");

  agentCopy.addEventListener("click", async () => {
    const selected = picker?.querySelector(":checked");
    const platform = selected ? ` ${selected.nextElementSibling.textContent}` : "";
    const guideUrl = selected?.dataset.guide ?? panel.dataset.agentGuide;
    const docs = new URL(guideUrl).origin;
    const prompt = `Help me set up this${platform} machine with set-me-up.

Read the official guide: ${guideUrl}
Blueprint structure: ${docs}/docs/guides/blueprints
Source: https://github.com/smeltery/set-me-up-blueprint

Inspect the operating system, existing dotfiles, and installed tools. Ask which configuration and modules I want to manage. Help me fork and configure a blueprint I control, keeping credentials and host secrets out of Git.

Review the bootstrap and its sources. Preview the installation destination, adapter, modules, and potential file conflicts before applying the setup. Start with one suitable module and explain the changes in the plan.

Use the documented commands for this platform. Verify the result with smu doctor and smu status, and explain how to update the blueprint afterward.`;
    agentText.textContent = prompt;
    try {
      await navigator.clipboard.writeText(prompt);
      if (picker && picker.querySelector(":checked") !== selected) return;
      showCopyConfirmation(agentCopy.querySelector("span"), "Prompt copied", "Copy agent prompt");
      status.textContent = "Setup prompt copied. Paste it into your coding agent to get started.";
    } catch {
      if (picker && picker.querySelector(":checked") !== selected) return;
      agentFallback.hidden = false;
      agentFallback.open = true;
      agentText.focus();
      window.getSelection().selectAllChildren(agentText);
      status.textContent = "Clipboard unavailable. Copy the selected prompt manually.";
    }
  });

  agentCopy.hidden = false;
}

for (const panel of document.querySelectorAll("[data-copy-command]")) {
  const command = panel.querySelector("code");
  const copy = panel.querySelector("button");
  const status = panel.querySelector('[role="status"]');
  highlightCommand(command, command.textContent);
  copy.addEventListener("click", () => copyCommand(command, copy, status));
  copy.hidden = false;
}

async function copyCommand(command, button, status, isCurrent = () => true) {
  try {
    await navigator.clipboard.writeText(command.textContent);
    if (!isCurrent()) return;
    showCopyConfirmation(button, "Copied", "Copy");
    status.textContent = "Command copied.";
  } catch {
    if (!isCurrent()) return;
    window.getSelection().selectAllChildren(command);
    status.textContent = "Clipboard unavailable. Copy the selected command manually.";
  }
}
