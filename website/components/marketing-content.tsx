import { Wordmark } from "@/components/logo";
// Native React markup ported from the original marketing sections.
import { SetupPanel, AgentPromptButton, PlateCommand } from "@/components/setup-panel";
import { SetupLab } from "@/components/setup-lab";
import { ContentPicker, LabLink } from "@/components/content-picker";
import { RestArt, ForestFooter } from "@/components/rest-art";
import { Landscape, HeroTrail } from "@/components/landscape";
import { FeatureTile } from "@/components/feature-tile";
import { documentationOrigin } from "@/lib/documentation";

export function MarketingContent() {
  return (
    <div className="marketing-content">
      <main id="main" tabIndex={-1}>
        <div className="hero" data-ascii-scene={true}>
          <img
            className="landscape hero-glyphs"
            src="/hero-glyphs.svg"
            width={1440}
            height={760}
            alt=""
            fetchPriority="high"
          />
          <Landscape kind="hero" className="landscape hero-landscape" />
          <HeroTrail />
          <div className="wrap hero-content">
            <p className="eyebrow">
              <span className="signal" aria-hidden="true"></span>
              {" Dotfiles & system setup"}
            </p>
            <h1>
              {"Your setup,"}
              <br />
              {"repeatable."}
            </h1>
            <p className="lede">
              {"Keep your setup in a blueprint. Use "}
              <code>{"smu"}</code>
              {" to apply the modules each machine needs."}
            </p>
            <SetupPanel />
          </div>
        </div>
        <section className="wrap guide" id="how-it-works" aria-labelledby="guide-title">
          <div className="section-heading overview-heading">
            <p className="eyebrow">{"01 / How it works"}</p>
            <h2 id="guide-title">{"One blueprint. Your setup."}</h2>
          </div>
          <div className="plates">
            <article className="plate">
              <figure>
                <p className="plate-label">{"blueprint · source repo"}</p>
                <div className="plate-illustration" aria-hidden="true">
                  <div className="blueprint-browser">
                    <div className="blueprint-browser-bar">
                      <span>{"[~/] blueprint"}</span>
                      <span>{"⑂ main"}</span>
                    </div>
                    <RestArt
                      piece="file-tree"
                      logo={false}
                      className="rest-file-tree"
                      aria-label=""
                    />
                  </div>
                </div>
                <PlateCommand command="smu blueprint doctor" />
              </figure>
              <h3>{"Start with a blueprint"}</h3>
              <p>
                {
                  "Keep your dotfiles, machine profiles, and module choices in a repository you control."
                }
              </p>
            </article>
            <article className="plate">
              <figure>
                <p className="plate-label">{"modules · your platform"}</p>
                <div className="plate-illustration" aria-hidden="true">
                  <div className="feature-tile" data-feature-tile="modules">
                    <FeatureTile feature="modules" />
                  </div>
                </div>
                <PlateCommand command="smu --list-modules" />
              </figure>
              <h3>{"Choose what to install"}</h3>
              <p>
                {
                  "Pick the modules that install your packages, link your dotfiles, and set your preferences."
                }
              </p>
            </article>
            <article className="plate">
              <figure>
                <p className="plate-label">{"plan · local machine"}</p>
                <div className="plate-illustration" aria-hidden="true">
                  <div className="feature-tile" data-feature-tile="plan">
                    <FeatureTile feature="plan" />
                  </div>
                </div>
                <PlateCommand command="smu plan" />
              </figure>
              <h3>{"Preview the changes"}</h3>
              <p>
                {
                  "Inspect the adapter, modules, and potential file conflicts before applying your setup."
                }
              </p>
            </article>
          </div>
        </section>
        <section className="blueprint-section" id="blueprint" aria-labelledby="blueprint-title">
          <div className="wrap blueprint-layout">
            <div className="section-heading">
              <p className="eyebrow">{"02 / Inside the blueprint"}</p>
              <h2 id="blueprint-title">{"Your setup is just files."}</h2>
              <p>
                {
                  "See where the decisions live. Keep them in Git, review the changes, and make the setup your own."
                }
              </p>
              <a
                className="section-guide guide-link"
                href={documentationOrigin + "/docs/guides/blueprints"}
              >
                {"Explore blueprint structure "}
                <span aria-hidden="true">{"↗"}</span>
              </a>
            </div>
            <ContentPicker className="file-explorer">
              <div className="explorer-bar">
                <span aria-hidden="true">{"[~/]"}</span>
                {" your-blueprint "}
                <span>{"Example files"}</span>
              </div>
              <div className="explorer-body">
                <fieldset className="file-picker" hidden={true}>
                  <legend className="sr-only">{"Explore blueprint files"}</legend>
                  <label>
                    <input
                      type="radio"
                      name="blueprint-file"
                      value="config"
                      defaultChecked={true}
                    />
                    <span>
                      {"smu.toml"}
                      <small>{"Profiles & modules"}</small>
                    </span>
                  </label>
                  <label>
                    <input type="radio" name="blueprint-file" value="dotfiles" />
                    <span>
                      {"dotfiles/rcrc"}
                      <small>{"Dotfile selection"}</small>
                    </span>
                  </label>
                  <label>
                    <input type="radio" name="blueprint-file" value="module" />
                    <span>
                      {"modules/example/"}
                      <small>{"Your custom module"}</small>
                    </span>
                  </label>
                </fieldset>
                <div className="file-detail" data-picker-panel="config">
                  <p className="file-path">{"smu.toml"}</p>
                  <pre>
                    <code>
                      <span className="file-key">{"[provisioning]"}</span>
                      {"\nadapter = "}
                      <span className="file-value">{'"rcm"'}</span>
                      <span className="file-key">{"[profile.default]"}</span>
                      {"\nmodules = ["}
                      <span className="file-value">{'"example"'}</span>
                      {"]"}
                    </code>
                  </pre>
                  <p>
                    {
                      "Choose an adapter and the modules for a profile. This example uses the starter blueprint’s "
                    }
                    <code>{"example"}</code>
                    {" module."}
                  </p>
                  <a href={documentationOrigin + "/docs/guides/machine-profiles"}>
                    {"Understand profiles "}
                    <span aria-hidden="true">{"↗"}</span>
                  </a>
                </div>
                <div className="file-detail" data-picker-panel="dotfiles" hidden={true}>
                  <p className="file-path">{"dotfiles/rcrc"}</p>
                  <pre>
                    <code>
                      {"TAGS="}
                      <span className="file-value">{'"work example smu"'}</span>
                      {"\nEXCLUDES="}
                      <span className="file-value">{'"base modules utilities"'}</span>
                    </code>
                  </pre>
                  <p>
                    {"Use rcm tags to select groups of dotfiles. Put your files in "}
                    <code>{"dotfiles/tag-work/"}</code>
                    {" and preview the links before applying them."}
                  </p>
                  <a href={documentationOrigin + "/docs/guides/dotfiles"}>
                    {"Organize your dotfiles "}
                    <span aria-hidden="true">{"↗"}</span>
                  </a>
                </div>
                <div className="file-detail" data-picker-panel="module" hidden={true}>
                  <p className="file-path">{"dotfiles/modules/example/"}</p>
                  <pre>
                    <code>
                      {"your-blueprint/\n└─ dotfiles/\n   └─ modules/\n      └─ "}
                      <span className="file-value">{"example/"}</span>
                    </code>
                  </pre>
                  <p>
                    {
                      "The starter blueprint includes a custom module. Use it as a starting point for work that belongs to your setup."
                    }
                  </p>
                  <a href={documentationOrigin + "/docs/guides/author-a-module"}>
                    {"Build a module "}
                    <span aria-hidden="true">{"↗"}</span>
                  </a>
                </div>
              </div>
            </ContentPicker>
          </div>
        </section>
        <section className="workbench" id="workflow" aria-labelledby="workflow-title">
          <div className="wrap">
            <div className="section-heading lab-heading">
              <p className="eyebrow">{"03 / Interactive setup lab"}</p>
              <h2 id="workflow-title">{"From blueprint to machine."}</h2>
              <p>
                {
                  "Watch a setup take shape, from first preview to next update. Pause anytime to explore a step."
                }
              </p>
            </div>
            <SetupLab />
          </div>
        </section>
        <section
          className="cta-section"
          data-ascii-scene={true}
          id="next-machine"
          aria-labelledby="cta-title"
        >
          <img
            className="cta-art"
            src="/cta-glyphs.svg"
            width={1440}
            height={440}
            alt=""
            loading="lazy"
            aria-hidden="true"
          />
          <Landscape kind="cta" className="cta-art cta-landscape" />
          <div className="wrap cta-content">
            <p className="eyebrow">{"Your next machine"}</p>
            <h2 id="cta-title">
              {"Make this setup"}
              <br />
              {"the one you keep."}
            </h2>
            <p>
              {
                "Put your dotfiles, modules, and machine choices in a blueprint. Start small, review the plan, and build from there."
              }
            </p>
            <div className="actions">
              <a className="button button-light" href={documentationOrigin + "/docs/quick-start"}>
                {"Get started"}
              </a>
              <AgentPromptButton className="button cta-secondary" />
            </div>
          </div>
        </section>
        <section className="wrap support" id="platforms" aria-labelledby="platforms-title">
          <div className="section-heading">
            <p className="eyebrow">{"04 / Platforms and adapters"}</p>
            <h2 id="platforms-title">{"Choose your machine."}</h2>
            <p>
              {
                "See which modules and adapters fit your platform, then try that profile in the setup lab."
              }
            </p>
          </div>
          <div className="platforms">
            <article className="platform-card">
              <div className="platform-card-heading">
                <span aria-hidden="true">{"[>_]"}</span>
                <h3>{"macOS"}</h3>
              </div>
              <p>
                {"Combine macOS and shared modules. Use shell scripts with "}
                <code>{"rcm"}</code>
                {" for dotfiles or choose a compatible Nix adapter."}
              </p>
              <div className="platform-actions">
                <LabLink
                  href="#workflow"
                  className="button button-cobalt"
                  aria-label="Preview macOS setup in the lab"
                  machine="macos"
                >
                  {"Preview macOS "}
                  <span aria-hidden="true">{"→"}</span>
                </LabLink>
                <a
                  className="platform-guide"
                  href={documentationOrigin + "/docs/reference/adapters"}
                >
                  {"Adapter reference "}
                  <span aria-hidden="true">{"→"}</span>
                </a>
              </div>
            </article>
            <article className="platform-card">
              <div className="platform-card-heading">
                <span aria-hidden="true">{"[>_]"}</span>
                <h3>{"Linux desktop"}</h3>
              </div>
              <p>
                {
                  "Choose modules for Debian, Ubuntu, or Arch. Use Home Manager where your modules provide a Nix implementation."
                }
              </p>
              <div className="platform-actions">
                <LabLink
                  href="#workflow"
                  className="button button-cobalt"
                  aria-label="Preview Linux setup in the lab"
                  machine="linux"
                >
                  {"Preview Linux "}
                  <span aria-hidden="true">{"→"}</span>
                </LabLink>
                <a
                  className="platform-guide"
                  href={documentationOrigin + "/docs/guides/machine-profiles"}
                >
                  {"Machine profiles "}
                  <span aria-hidden="true">{"→"}</span>
                </a>
              </div>
            </article>
            <article className="platform-card">
              <div className="platform-card-heading">
                <span aria-hidden="true">{"[>_]"}</span>
                <h3>{"Headless VPS"}</h3>
              </div>
              <p>
                {"Use the "}
                <code>{"vps"}</code>
                {" profile on Debian or Ubuntu to start with modules designed for a server."}
              </p>
              <div className="platform-actions">
                <LabLink
                  href="#workflow"
                  className="button button-cobalt"
                  aria-label="Preview VPS setup in the lab"
                  machine="vps"
                >
                  {"Preview VPS "}
                  <span aria-hidden="true">{"→"}</span>
                </LabLink>
                <a className="platform-guide" href={documentationOrigin + "/docs/guides/vps"}>
                  {"Headless VPS guide "}
                  <span aria-hidden="true">{"→"}</span>
                </a>
              </div>
            </article>
          </div>
          <div className="platform-logos" aria-label="Explore platform and adapter guides">
            <a href={documentationOrigin + "/docs/quick-start"}>
              <RestArt piece="apple" logo={true} className="" aria-label="macOS ASCII logo" />
              <span>{"macOS"}</span>
            </a>
            <a href={documentationOrigin + "/docs/guides/vps"}>
              <RestArt piece="debian" logo={true} className="" aria-label="Debian ASCII logo" />
              <span>{"Debian"}</span>
            </a>
            <a href={documentationOrigin + "/docs/guides/machine-profiles"}>
              <RestArt piece="ubuntu" logo={true} className="" aria-label="Ubuntu ASCII logo" />
              <span>{"Ubuntu"}</span>
            </a>
            <a href={documentationOrigin + "/docs/guides/machine-profiles"}>
              <RestArt piece="arch-linux" logo={true} className="" aria-label="Arch ASCII logo" />
              <span>{"Arch"}</span>
            </a>
            <a href={documentationOrigin + "/docs/reference/adapters"}>
              <RestArt
                piece="nixos"
                logo={true}
                className=""
                aria-label="Nix adapters ASCII logo"
              />
              <span>{"Nix adapters"}</span>
            </a>
          </div>
        </section>
        <section className="start-section" id="start" aria-labelledby="start-title">
          <div className="wrap">
            <div className="section-heading">
              <p className="eyebrow">{"05 / Your next step"}</p>
              <h2 id="start-title">{"Start where you are."}</h2>
              <p>{"A focused path through the docs, based on the setup you already have."}</p>
            </div>
            <ContentPicker className="start-path">
              <fieldset className="path-picker" hidden={true}>
                <legend className="sr-only">{"Choose your starting point"}</legend>
                <label>
                  <input type="radio" name="starting-point" value="first" defaultChecked={true} />
                  <span>{"I'm starting fresh"}</span>
                </label>
                <label>
                  <input type="radio" name="starting-point" value="existing" />
                  <span>{"I have dotfiles"}</span>
                </label>
                <label>
                  <input type="radio" name="starting-point" value="nix" />
                  <span>{"I'm exploring Nix"}</span>
                </label>
              </fieldset>
              <div className="path-content" data-picker-panel="first">
                <div className="path-intro">
                  <h3>{"Your first repeatable setup."}</h3>
                  <p>
                    {
                      "Start with the blueprint template and try one module before expanding your setup."
                    }
                  </p>
                  <a
                    className="section-guide guide-link"
                    href={documentationOrigin + "/docs/quick-start"}
                  >
                    {"Open the quick start "}
                    <span aria-hidden="true">{"↗"}</span>
                  </a>
                </div>
                <ol className="path-steps">
                  <li>
                    <span>{"01"}</span>
                    <div>
                      <h4>{"Fork a blueprint"}</h4>
                      <p>{"Choose the repository and branch you will own."}</p>
                    </div>
                  </li>
                  <li>
                    <span>{"02"}</span>
                    <div>
                      <h4>{"Review the bootstrap"}</h4>
                      <p>{"Inspect its source, destination, and installation plan."}</p>
                    </div>
                  </li>
                  <li>
                    <span>{"03"}</span>
                    <div>
                      <h4>{"Try one module"}</h4>
                      <p>{"Verify the CLI, preview the changes, then apply."}</p>
                    </div>
                  </li>
                </ol>
              </div>
              <div className="path-content" data-picker-panel="existing" hidden={true}>
                <div className="path-intro">
                  <h3>{"Bring the files you already use."}</h3>
                  <p>
                    {
                      "Move a small group of dotfiles first so you can check exactly which paths the blueprint will manage."
                    }
                  </p>
                  <a
                    className="section-guide guide-link"
                    href={documentationOrigin + "/docs/guides/dotfiles"}
                  >
                    {"Open the dotfiles guide "}
                    <span aria-hidden="true">{"↗"}</span>
                  </a>
                </div>
                <ol className="path-steps">
                  <li>
                    <span>{"01"}</span>
                    <div>
                      <h4>{"Choose a tag"}</h4>
                      <p>{"Group the files under a tag in your blueprint."}</p>
                    </div>
                  </li>
                  <li>
                    <span>{"02"}</span>
                    <div>
                      <h4>{"Preview the links"}</h4>
                      <p>
                        {"Run "}
                        <code>{"smu --lsrc"}</code>
                        {" and compare each destination."}
                      </p>
                    </div>
                  </li>
                  <li>
                    <span>{"03"}</span>
                    <div>
                      <h4>{"Apply and verify"}</h4>
                      <p>{"Resolve existing files first, then check the resulting links."}</p>
                    </div>
                  </li>
                </ol>
              </div>
              <div className="path-content" data-picker-panel="nix" hidden={true}>
                <div className="path-intro">
                  <h3>{"Migrate one piece at a time."}</h3>
                  <p>
                    {
                      "Compare module coverage and test a hybrid configuration before switching your primary machine."
                    }
                  </p>
                  <a
                    className="section-guide guide-link"
                    href={documentationOrigin + "/docs/guides/nix-migration"}
                  >
                    {"Open the migration guide "}
                    <span aria-hidden="true">{"↗"}</span>
                  </a>
                </div>
                <ol className="path-steps">
                  <li>
                    <span>{"01"}</span>
                    <div>
                      <h4>{"Compare coverage"}</h4>
                      <p>{"Check which modules support your intended Nix adapter."}</p>
                    </div>
                  </li>
                  <li>
                    <span>{"02"}</span>
                    <div>
                      <h4>{"Draft separately"}</h4>
                      <p>{"Generate and review a starter configuration in a test checkout."}</p>
                    </div>
                  </li>
                  <li>
                    <span>{"03"}</span>
                    <div>
                      <h4>{"Preflight one host"}</h4>
                      <p>{"Review unsupported modules and fallback decisions before applying."}</p>
                    </div>
                  </li>
                </ol>
              </div>
            </ContentPicker>
          </div>
        </section>
        <section className="orbit-section" id="make-it-yours" aria-labelledby="orbit-title">
          <div className="orbit-card" data-ascii-scene={true}>
            <div className="orbit-art" aria-hidden="true">
              <img src="/orbit-glyphs.svg" width={900} height={600} alt="" loading="lazy" />
              <Landscape kind="orbit" className="" />
            </div>
            <div className="wrap orbit-inner">
              <div className="orbit-content">
                <p className="eyebrow">{"Make it yours"}</p>
                <h2 id="orbit-title">
                  {"Your setup."}
                  <br />
                  {"Your repository."}
                </h2>
                <p>
                  {
                    "Fork the starter blueprint, choose your modules, and keep your configuration in a repository you control."
                  }
                </p>
                <div className="actions">
                  <a
                    className="button orbit-primary"
                    href="https://github.com/smeltery/set-me-up-blueprint/fork"
                  >
                    {"Fork the blueprint"}
                  </a>
                  <a
                    className="button orbit-secondary"
                    href={documentationOrigin + "/docs/guides/blueprints"}
                  >
                    {"Blueprint guide"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="faq-section" id="faq" aria-labelledby="faq-title">
          <div className="wrap faq-layout">
            <div className="section-heading">
              <p className="eyebrow">{"06 / Field notes"}</p>
              <h2 id="faq-title">{"Before the first run."}</h2>
              <p>
                {
                  "Bring over your dotfiles, check the plan, and know where to look if setup stalls."
                }
              </p>
            </div>
            <div className="faq-list">
              <details id="field-note-dotfiles" open={true}>
                <summary>
                  <span className="note-topic">{"Bring your dotfiles"}</span>
                  <span>{"Can I bring my existing dotfiles?"}</span>
                </summary>
                <div className="note-answer">
                  <p>
                    {"Start from a blueprint you control and add your files to it. In the "}
                    <code>{"rcm"}</code>
                    {" flow, tags group files and "}
                    <code>{"smu --lsrc"}</code>
                    {" previews the links."}
                  </p>
                  <div className="note-actions">
                    <a className="guide-link" href={documentationOrigin + "/docs/guides/dotfiles"}>
                      {"Read the dotfiles guide "}
                      <span aria-hidden="true">{"→"}</span>
                    </a>
                    <a
                      className="note-permalink"
                      href="#field-note-dotfiles"
                      aria-label="Link to note: Can I bring my existing dotfiles?"
                    >
                      <svg
                        width={16}
                        height={16}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </details>
              <details id="field-note-plan">
                <summary>
                  <span className="note-topic">{"Review the plan"}</span>
                  <span>{"What does a plan actually show?"}</span>
                </summary>
                <div className="note-answer">
                  <p>
                    <code>{"smu plan"}</code>
                    {
                      " summarizes the blueprint, adapter, modules, and potential dotfile conflicts. Review that output and the module sources before applying anything."
                    }
                  </p>
                  <div className="note-actions">
                    <a className="guide-link" href={documentationOrigin + "/docs/quick-start"}>
                      {"Read the quick start "}
                      <span aria-hidden="true">{"→"}</span>
                    </a>
                    <a
                      className="note-permalink"
                      href="#field-note-plan"
                      aria-label="Link to note: What does a plan actually show?"
                    >
                      <svg
                        width={16}
                        height={16}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </details>
              <details id="field-note-updates">
                <summary>
                  <span className="note-topic">{"Keep it current"}</span>
                  <span>{"How do updates work?"}</span>
                </summary>
                <div className="note-answer">
                  <p>
                    {
                      "Update the blueprint, installer, and modules separately or preview a combined update with "
                    }
                    <code>{"smu update --all --dry-run"}</code>
                    {"."}
                  </p>
                  <div className="note-actions">
                    <a className="guide-link" href={documentationOrigin + "/docs/guides/updates"}>
                      {"Read the updates guide "}
                      <span aria-hidden="true">{"→"}</span>
                    </a>
                    <a
                      className="note-permalink"
                      href="#field-note-updates"
                      aria-label="Link to note: How do updates work?"
                    >
                      <svg
                        width={16}
                        height={16}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </details>
              <details id="field-note-troubleshoot">
                <summary>
                  <span className="note-topic">{"Troubleshoot"}</span>
                  <span>{"Where do I look when setup stalls?"}</span>
                </summary>
                <div className="note-answer">
                  <p>
                    {"Start with "}
                    <code>{"smu doctor"}</code>
                    {
                      " and the failing command’s output. Check that the module matches your platform and selected provisioning adapter."
                    }
                  </p>
                  <div className="note-actions">
                    <a
                      className="guide-link"
                      href={documentationOrigin + "/docs/guides/troubleshooting"}
                    >
                      {"Read the troubleshooting guide "}
                      <span aria-hidden="true">{"→"}</span>
                    </a>
                    <a
                      className="note-permalink"
                      href="#field-note-troubleshoot"
                      aria-label="Link to note: Where do I look when setup stalls?"
                    >
                      <svg
                        width={16}
                        height={16}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <ForestFooter />
        <div className="wrap footer-main">
          <div className="footer-brand">
            <a className="home" href="/" aria-label="set-me-up home">
              <Wordmark className="footer-wordmark" />
            </a>
            <p>
              {"Keep your dotfiles, packages, and machine preferences in a blueprint you control."}
            </p>
          </div>
          <nav className="footer-nav" aria-label="Footer">
            <div className="footer-group">
              <h2>{"Explore"}</h2>
              <ul>
                <li>
                  <a href="/#how-it-works">{"How it works"}</a>
                </li>
                <li>
                  <a href="/#blueprint">{"Inside the blueprint"}</a>
                </li>
                <li>
                  <a href="/#workflow">{"Setup lab"}</a>
                </li>
                <li>
                  <a href="/#platforms">{"Platforms"}</a>
                </li>
                <li>
                  <a href="/#start">{"Getting started"}</a>
                </li>
                <li>
                  <a href="/#faq">{"Field Notes"}</a>
                </li>
              </ul>
            </div>
            <div className="footer-group">
              <h2>{"Docs"}</h2>
              <ul>
                <li>
                  <a href={documentationOrigin + "/docs/quick-start"}>{"Quick start"}</a>
                </li>
                <li>
                  <a href={documentationOrigin + "/docs/guides/blueprints"}>{"Blueprints"}</a>
                </li>
                <li>
                  <a href={documentationOrigin + "/docs/reference/cli"}>{"CLI reference"}</a>
                </li>
                <li>
                  <a href={documentationOrigin + "/docs/guides/troubleshooting"}>{"Get help"}</a>
                </li>
              </ul>
            </div>
            <div className="footer-group">
              <h2>{"Workflows"}</h2>
              <ul>
                <li>
                  <a href={documentationOrigin + "/docs/guides/vps"}>{"Headless VPS"}</a>
                </li>
                <li>
                  <a href={documentationOrigin + "/docs/guides/nix-migration"}>{"Nix migration"}</a>
                </li>
                <li>
                  <a href={documentationOrigin + "/docs/guides/fleet"}>{"Fleet planning"}</a>
                </li>
                <li>
                  <a href={documentationOrigin + "/docs/guides/updates"}>{"Updates"}</a>
                </li>
              </ul>
            </div>
            <div className="footer-group">
              <h2>{"Project"}</h2>
              <ul>
                <li>
                  <a href="https://github.com/smeltery/set-me-up">
                    {"GitHub "}
                    <span aria-hidden="true">{"↗"}</span>
                  </a>
                </li>
                <li>
                  <a href="https://github.com/smeltery/set-me-up/issues">
                    {"Issues "}
                    <span aria-hidden="true">{"↗"}</span>
                  </a>
                </li>
                <li>
                  <a href="https://github.com/smeltery/set-me-up/blob/master/CONTRIBUTING.md">
                    {"Contribute "}
                    <span aria-hidden="true">{"↗"}</span>
                  </a>
                </li>
                <li>
                  <a href="https://github.com/smeltery/set-me-up/blob/master/LICENSE">
                    {"License "}
                    <span aria-hidden="true">{"↗"}</span>
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="footer-rail">
          <div className="wrap">
            <nav className="footer-shortcuts" aria-label="Footer shortcuts">
              <a className="rail-mark" href="/" aria-label="set-me-up home">
                {"[>_]"}
              </a>
              <a href={documentationOrigin + "/"}>
                <span aria-hidden="true">{"01:"}</span>
                {"docs"}
              </a>
              <a href="/#workflow">
                <span aria-hidden="true">{"02:"}</span>
                {"lab"}
              </a>
              <a href="https://github.com/smeltery/set-me-up">
                <span aria-hidden="true">{"03:"}</span>
                {"source"}
              </a>
            </nav>
            <a href="#top" aria-label="Back to top">
              {"Top "}
              <span aria-hidden="true">{"↑"}</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
