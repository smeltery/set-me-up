import { RetroComputer } from "@/components/asciicn/retro-computer";
import { ServerRack } from "@/components/asciicn/server-rack";
import { usePrefersReducedMotion } from "@/lib/ascii/motion";
import { createRoot } from "react-dom/client";

const rackActivity = { discover: .25, preview: .45, apply: .9, maintain: .65 };

function DesktopScene({ machine, command, done, cell }) {
  const reducedMotion = usePrefersReducedMotion();
  return (
    <RetroComputer className="lab-machine-scene" interactive={!reducedMotion}
      cell={cell} charset="petscii" color="#deefdc" screen="blueprint" prompt="$"
      banner={["SET-ME-UP", machine === "macos" ? "macOS WORKSTATION" : "LINUX WORKSTATION"]}
      script={[{ command, output: [done ? "EXAMPLE COMPLETE" : "EXAMPLE PREVIEW"] }]} />
  );
}

export function createLabMachine(container) {
  const root = createRoot(container);
  let current;
  let cell;

  function draw() {
    if (!current) return;
    const { machine, stage, command, done } = current;
    root.render(machine === "vps" ? (
      <ServerRack className="lab-machine-scene" units={9} cell={cell}
        activity={done && stage === "apply" ? .55 : rackActivity[stage]} />
    ) : (
      <DesktopScene key={`${machine}-${stage}-${done}`}
        machine={machine} command={command} done={done} cell={cell} />
    ));
  }

  function resize() {
    const next = Math.max(5, Math.min(9, Math.round(container.clientWidth / 68)));
    if (next === cell) return;
    cell = next;
    draw();
  }

  new ResizeObserver(resize).observe(container);
  resize();

  return state => {
    current = state;
    draw();
  };
}
