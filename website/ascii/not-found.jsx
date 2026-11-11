import { NotFound } from "@/components/asciicn/not-found";
import { createRoot } from "react-dom/client";

export function mountNotFound(container, { home = "/", docs = `${container.dataset.docsUrl}/docs` } = {}) {
  const root = createRoot(container);
  root.render(
    <NotFound
      className="not-found-scene"
      charset="braille"
      colorMode="truecolor"
      accent="#efecac"
      wind={0.8}
      cell={8}
      title="You’re a little off trail."
      description="This page may have moved, or the link may be out of date. Let’s get you back to your setup."
      actions={<>
        <a className="button button-light" href={home}>Back to home</a>
        <a className="button button-hero-secondary" href={docs}>Browse the docs</a>
      </>}
    />
  );
  return () => root.unmount();
}

const container = document.querySelector("#not-found-scene");
if (container) mountNotFound(container);
