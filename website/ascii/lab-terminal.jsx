import { TerminalWindow } from "@/components/asciicn/terminal-window";
import { createRoot } from "react-dom/client";

export { mountFeatureTile } from "./feature-tiles.jsx";
export { mountHeroTrail } from "./hero-trail.jsx";

export function mountSetupTerminal(container, content) {
  function attachContent(screen) {
    if (!screen) return;
    screen.append(content);
    container.closest(".setup-shell").dataset.enhanced = "";
  }

  createRoot(container).render(
    <TerminalWindow title="Setup shell" size="md" padding={0} filled
      staticContent={<div ref={attachContent} />} />
  );
}

export function createLabTerminal(container) {
  const root = createRoot(container);
  let observer;
  let paused = false;
  let session = 0;
  return {
    setPaused(value) {
      paused = value;
      const control = container.querySelector(`button[aria-label="${paused ? "Pause" : "Play"} the terminal session"]`);
      control?.click();
    },
    play(command, lines, showProgress, onComplete) {
      observer?.disconnect();
      // The pinned component exposes playback state through its accessible control.
      observer = new MutationObserver(() => {
        if (container.querySelector('button[aria-label="Replay the terminal session"]')) {
          observer.disconnect();
          onComplete();
        } else {
          const control = container.querySelector(`button[aria-label="${paused ? "Pause" : "Play"} the terminal session"]`);
          control?.click();
        }
      });
      observer.observe(container, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-label"] });
      const script = [
        { kind: "command", text: command },
        { kind: "task", text: "Reading example blueprint", done: "Example blueprint loaded", duration: .65 },
        ...(showProgress ? [{ kind: "progress", label: "Simulating apply", width: 10, duration: 1.4 }] : []),
        { kind: "output", text: lines.join("\n") },
      ];
      root.render(
        <TerminalWindow key={++session} title="smu / example session" script={script} size="md" rows={9} speed={2.8} loop={false} />
      );
    },
    clear() {
      observer?.disconnect();
      root.render(null);
    },
  };
}
