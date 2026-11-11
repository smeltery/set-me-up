"use client";

import { useEffect, useId, useRef, useState } from "react";
import { TerminalWindow } from "@/components/asciicn/terminal-window";
import { documentationOrigin } from "@/lib/documentation";

export function CommandCode({ command }) {
  let executable = true;
  return (
    <code>
      {command.split(/(\s+|&&|\|\||[|;])/).map((part, index) => {
        if (!part.trim()) return part;
        let kind;
        if (["&&", "||", "|", ";"].includes(part)) {
          executable = true;
          kind = "operator";
        } else if (executable) {
          executable = part === "sudo";
          kind = "command";
        } else if (part.startsWith("-")) kind = "flag";
        else if (part.includes("/") || part.endsWith(".sh")) kind = "value";
        return kind ? (
          <span key={index} className={`syntax-${kind}`}>
            {part}
          </span>
        ) : (
          part
        );
      })}
    </code>
  );
}

export function CopyButton({ text, className = "", children = "Copy", label, copied = "Copied" }) {
  const [state, setState] = useState("ready");
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    setState("ready");
    clearTimeout(timer.current);
  }, [text]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch (error) {
      console.error("Clipboard unavailable", error);
      setState("error");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("ready"), 2000);
  }
  return (
    <>
      <button className={className} type="button" aria-label={label} onClick={copy}>
        {state === "copied" ? copied : state === "error" ? "Retry" : children}
      </button>
      {state === "error" && (
        <details open className="agent-prompt-fallback">
          <summary>Copy manually</summary>
          <pre tabIndex={0}>{text}</pre>
        </details>
      )}
      <span className="sr-only" role="status">
        {state === "copied" ? "Copied to clipboard." : ""}
      </span>
    </>
  );
}

export function AgentPromptButton({
  platform = "my machine",
  guide = "/docs/quick-start",
  className = "button button-hero-secondary agent-prompt-button",
}) {
  const prompt = `Help me set up ${platform} using set-me-up. Read ${documentationOrigin}${guide} first.\n\nInspect the operating system, existing dotfiles, and installed tools. Ask which configuration and modules I want to manage. Help me fork and configure a blueprint I control, keeping credentials and host secrets out of Git.\n\nReview the bootstrap and its sources. Preview the installation destination, adapter, modules, and potential file conflicts before applying the setup. Start with one suitable module and explain the changes in the plan.\n\nUse the documented commands for this platform. Verify the result with smu doctor and smu status, and explain how to update the blueprint afterward.`;
  return (
    <CopyButton text={prompt} className={className} copied="Prompt copied">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <rect x="8" y="8" width="12" height="12" rx="2" />
        <path d="M15 8V4H4v11h4" />
      </svg>
      <span>Copy agent prompt</span>
    </CopyButton>
  );
}

const bootstrap =
  "curl -fLo smu-bootstrap.sh https://raw.githubusercontent.com/smeltery/set-me-up-blueprint/master/dotfiles/modules/install.sh";
const platforms = [
  {
    name: "macOS",
    command: bootstrap,
    guide: "/docs/quick-start",
    label: "Read the quick start",
    note: "Download the starter bootstrap and follow the guide to review and preview your setup.",
  },
  {
    name: "Linux",
    command: bootstrap,
    guide: "/docs/quick-start#prerequisites",
    label: "Read the Linux quick start",
    note: "Download the starter bootstrap. The quick start covers Debian, Ubuntu, and Arch.",
  },
  {
    name: "Headless VPS",
    command: "sudo apt-get update && sudo apt-get install bash curl git ca-certificates python3",
    guide: "/docs/guides/vps",
    label: "Read the VPS guide",
    note: "Install the prerequisites on your Debian or Ubuntu host, then follow the VPS guide.",
  },
];
export function SetupPanel() {
  const [index, setIndex] = useState(0);
  const name = useId();
  const platform = platforms[index];
  return (
    <div className="hero-console">
      <div className="setup-shell" data-enhanced="">
        <div className="setup-terminal">
          <TerminalWindow
            title="set-me-up / setup"
            size="md"
            padding={0}
            filled
            staticContent={
              <div className="setup-shell-content">
                <fieldset className="launch-picker">
                  <legend className="sr-only">Choose your setup platform</legend>
                  {platforms.map((item, itemIndex) => (
                    <label key={item.name}>
                      <input
                        type="radio"
                        name={name}
                        checked={index === itemIndex}
                        onChange={() => setIndex(itemIndex)}
                      />
                      <span>{item.name}</span>
                    </label>
                  ))}
                </fieldset>
                <div className="setup-command-toolbar">
                  <span>{index === 2 ? "Install prerequisites" : "Download bootstrap"}</span>
                  <CopyButton
                    text={platform.command}
                    className="setup-copy"
                    label="Copy getting started command"
                    copied={<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg><span>Copied</span></>}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M15 8V4H4v11h4" /></svg><span>Copy</span>
                  </CopyButton>
                </div>
                <div className="launch-command">
                  <span aria-hidden="true">$</span>
                  <CommandCode command={platform.command} />
                </div>
              </div>
            }
          />
        </div>
      </div>
      <p className="hero-console-note">{platform.note}</p>
      <div className="actions">
        <a className="button button-light launch-guide" href={documentationOrigin + platform.guide}>
          <span>{platform.label}</span>
          <span aria-hidden="true">↗</span>
        </a>
        <AgentPromptButton platform={platform.name} guide={platform.guide} />
      </div>
    </div>
  );
}

export function PlateCommand({ command }) {
  return (
    <figcaption className="plate-command">
      <span aria-hidden="true">$</span>
      <CommandCode command={command} />
      <CopyButton text={command} label={`Copy ${command}`} />
    </figcaption>
  );
}
