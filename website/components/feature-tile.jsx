"use client";

import { useRef, useState } from "react";
import { useFrameLoop } from "@/lib/ascii/motion";

const labels = {
  blueprint: ["01", "Define", "smu.toml"],
  modules: ["02", "Compose", "module inventory"],
  plan: ["03", "Review", "smu plan"],
};

/** One example follows the same default profile and base module across all three cards. */
export function FeatureTile({ feature }) {
  const target = useRef(null);
  const [phase, setPhase] = useState(2);
  useFrameLoop((time, delta) => {
    setPhase(delta === 0 ? 2 : Math.floor(time / (feature === "modules" ? 1.6 : feature === "plan" ? 2.4 : 2)) % 3);
  }, { target, fps: 2 });
  const [number, verb, source] = labels[feature];
  return (
    <div className="workflow-scene" data-workflow={feature} data-phase={phase} ref={target}>
      <div className="workflow-bar">
        <span><span className="workflow-number">{number}</span> {verb}</span>
        <span>{source}</span>
      </div>
      {feature === "blueprint" ? (
        <div className="workflow-config">
          <div data-emphasis={phase === 0}><span className="workflow-line">1</span><span className="syntax-flag">[provisioning]</span></div>
          <div data-emphasis={phase === 0}><span className="workflow-line">2</span>adapter = <span className="syntax-value">"rcm"</span></div>
          <div data-emphasis={phase === 1}><span className="workflow-line">3</span><span className="syntax-flag">[profile.default]</span></div>
          <div data-emphasis={phase === 2}><span className="workflow-line">4</span>modules = <span className="syntax-value">["base"]</span></div>
        </div>
      ) : feature === "modules" ? (
        <div className="workflow-inventory">
          <div className="workflow-bucket">universal / shared</div>
          <div className="workflow-module" data-selected="true" data-emphasis={phase === 1}>
            <span className="workflow-check">✓</span><span>base</span><small>selected</small>
          </div>
          <div className="workflow-bucket">macos / platform</div>
          <div className="workflow-module" data-emphasis={phase === 2}>
            <span className="workflow-check">·</span><span>terminal/alacritty</span><small>available</small>
          </div>
        </div>
      ) : (
        <div className="workflow-plan">
          {[ ["Profile", "default"], ["Adapter", "rcm"], ["Module", "base"] ].map(([label, value], index) => (
            <div key={label} data-emphasis={phase === index}>
              <span>{label}</span><strong>{value}</strong><span className="workflow-check">✓</span>
            </div>
          ))}
        </div>
      )}
      <div className="workflow-footer">
        <span>{feature === "blueprint" ? "Your repository" : feature === "modules" ? "1 module · default profile" : "Read-only preview"}</span>
        <span className="workflow-outcome">{feature === "blueprint" ? "Versioned in Git" : feature === "modules" ? "→ base" : "No writes"}</span>
      </div>
    </div>
  );
}
