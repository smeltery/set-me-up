export const profiles = {
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
    applyCheck:
      "Run smu status or smu doctor afterward. Review service and package changes before continuing on a production host.",
  },
};

export const stages = {
  discover: {
    label: "Discover",
    title: "Discover available modules.",
    guide: ["/docs/guides/modules", "Modules guide"],
    description: "Find the modules available for this machine and your shared setup.",
    check: (profile) =>
      `Match the module IDs to your blueprint. This walkthrough will apply ${profile.target} in step three.`,
    command: () => "smu --list-modules",
    output: (profile) => [
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
    check:
      "Check the blueprint and adapter first. Resolve any file conflicts or trust warnings before running a command that writes.",
    command: (profile) => profile.plan,
    output: (profile) => [
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
    description: (profile) =>
      profile.applyDescription ?? "Try applying the base module from the reviewed plan.",
    check: (profile) =>
      profile.applyCheck ??
      "Run smu status afterward to inspect detectable module state. A shell module without a detection marker can report unknown.",
    command: (profile) => profile.apply,
    output: (profile) => [
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
    check:
      "Review the refs and check for local edits. Resolve dirty or diverged checkouts before applying the update.",
    command: () => "smu update --all --dry-run",
    output: () => [
      "Blueprint      incoming commits to review",
      "Installer      already current in this example",
      "Modules        review changed submodule refs",
      "Worktree       clean in this example",
      "Writes         none (dry run)",
    ],
    complete:
      "Example update reviewed. The walkthrough is complete. Replay it or choose another machine.",
  },
};
