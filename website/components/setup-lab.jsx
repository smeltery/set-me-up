"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { TerminalWindow } from "@/components/asciicn/terminal-window";
import { CopyButton } from "@/components/setup-panel";
import { profiles, stages } from "@/lib/setup-data";
import { documentationOrigin } from "@/lib/documentation";

export function SetupLab() {
  const [machine, setMachine] = useState("macos"),
    [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true),
    [visible, setVisible] = useState(false),
    [documentVisible, setDocumentVisible] = useState(true);
  const reduced = useReducedMotion(),
    target = useRef(null);
  const keys = Object.keys(stages),
    stage = stages[keys[index]],
    profile = profiles[machine];
  const command = stage.command(profile),
    output = stage.output(profile);
  const guide = stage.guide ?? ["/docs/guides/planning", "Setup planning guide"];
  const value = (field) => (typeof field === "function" ? field(profile) : field);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.3,
    });
    observer.observe(target.current);
    const update = () => setDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    update();
    const select = (event) => {
      setMachine(event.detail);
      setIndex(0);
      setPlaying(false);
    };
    window.addEventListener("smu:select-machine", select);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("smu:select-machine", select);
    };
  }, []);
  const active = playing && visible && documentVisible && !reduced;
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setIndex((previous) => (previous + 1) % keys.length), 8500);
    return () => clearTimeout(timer);
  }, [active, index, machine, keys.length]);
  const script = [
    { kind: "command", text: command },
    {
      kind: "task",
      text: "Reading example blueprint",
      done: "Example blueprint loaded",
      duration: 0.65,
    },
    ...(keys[index] === "apply"
      ? [{ kind: "progress", label: "Simulating apply", width: 10, duration: 1.4 }]
      : []),
    { kind: "output", text: output.join("\n") },
  ];
  return (
    <div
      ref={target}
      className="setup-lab"
      data-profile={machine}
      data-stage={keys[index]}
      data-state="running"
      data-playing={active}
    >
      <div className="lab-controls">
        <fieldset className="lab-picker machine-picker">
          <legend className="sr-only">Choose a machine</legend>
          {[
            ["macos", "macOS"],
            ["linux", "Linux"],
            ["vps", "Headless VPS"],
          ].map(([key, label]) => (
            <label key={key}>
              <input
                type="radio"
                name="lab-machine"
                checked={machine === key}
                onChange={() => {
                  setMachine(key);
                  setIndex(0);
                }}
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
        <p className="lab-edition">Interactive demo</p>
      </div>
      <fieldset className="lab-picker stage-picker">
        <legend className="sr-only">Choose a setup stage</legend>
        {keys.map((key, step) => (
          <label key={key}>
            <input
              type="radio"
              name="lab-stage"
              checked={index === step}
              onChange={() => {
                setIndex(step);
                setPlaying(false);
              }}
            />
            <span>
              <small>{String(step + 1).padStart(2, "0")}</small> {stages[key].label}
            </span>
          </label>
        ))}
      </fieldset>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${machine}-${index}`}
          className="lab-grid"
          initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: reduced ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.25 }}
        >
          <div className="lab-operator">
            <div className="lab-copy">
              <p className="lab-step">
                Step {index + 1} of {keys.length}
              </p>
              <h3>{stage.title}</h3>
              <p>{value(stage.description)}</p>
            </div>
            <div className="console-actions">
              <button
                className="button button-cobalt"
                type="button"
                aria-pressed={playing && !reduced}
                onClick={() =>
                  reduced
                    ? setIndex((previous) => (previous + 1) % keys.length)
                    : setPlaying((previous) => !previous)
                }
              >
                {reduced ? "Next step" : playing ? "Pause demo" : "Play demo"}
                <span aria-hidden="true">{playing && !reduced ? "Ⅱ" : "▸"}</span>
              </button>
              <button
                className="lab-back"
                type="button"
                disabled={index === 0}
                onClick={() => {
                  setIndex((previous) => Math.max(0, previous - 1));
                  setPlaying(false);
                }}
              >
                ← Back
              </button>
            </div>
            <details className="lab-check">
              <summary>About this step</summary>
              <p>{value(stage.check)}</p>
              <a className="lab-guide guide-link" href={documentationOrigin + guide[0]}>
                {guide[1]} <span aria-hidden="true">↗</span>
              </a>
            </details>
          </div>
          <div className="transcript">
            <div className="transcript-label">
              <span>smu / example session</span>
              <CopyButton text={command} label="Copy command" />
            </div>
            <div className="lab-terminal">
              <TerminalWindow
                title="smu / example session"
                script={script}
                size="md"
                rows={9}
                speed={2.8}
                loop={false}
                paused={!active}
              />
            </div>
            <div className="terminal-caption">
              <span>Example result</span>
              <span>{stage.risk ?? "Read-only"}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <p className="lab-note">Simulated examples. No commands run on your machine.</p>
    </div>
  );
}
