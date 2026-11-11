// Set SITE_URL (or deploy on Vercel) to get real canonical URLs.
export const FALLBACK_SITE_ORIGIN = "http://127.0.0.1:4175" as const;

/** The canonical production origin, used when a production build has no other. */
export const PRODUCTION_SITE_ORIGIN =
  "https://set-me-up.vercel.app" as const;

const getBaseUrl = () => {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://127.0.0.1:4175";
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  return PRODUCTION_SITE_ORIGIN;
};

const baseUrl = getBaseUrl();

/**
 * The origin install commands and registry items point at. Unlike the
 * canonical URL, a Vercel preview uses its own deployment, so a command
 * copied from a preview installs that preview's code. scripts/build-registry.ts
 * uses the same rule. Each variable is read literally so Next inlines it into
 * client components (next.config.mjs passes them through).
 */
export const getRegistryOrigin = (): string => {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL.replace(/\/$/u, "");
  }
  if (process.env.VERCEL_ENV === "production") {
    const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    return host ? `https://${host}` : PRODUCTION_SITE_ORIGIN;
  }
  if (process.env.VERCEL_ENV && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return FALLBACK_SITE_ORIGIN;
};

export const SITE = {
  AUTHOR: {
    NAME: "Smeltery",
    URL: "https://github.com/smeltery",
  },
  DESCRIPTION: {
    LONG: "Keep dotfiles, modules, and machine profiles in a version-controlled blueprint. Review, provision, and maintain your setup with smu.",
    SHORT: "Repeatable dotfiles and machine setup",
  },
  KEYWORDS: [
    "dotfiles",
    "machine setup",
    "blueprint",
    "smu",
    "Nix",
    "rcm",
    "set-me-up",
  ] as const,
  NAME: "set-me-up",
  OG_IMAGE: `${baseUrl}/social-card.png`,
  REGISTRY: `${getRegistryOrigin()}/r`,
  URL: baseUrl,
};

export const META_THEME_COLORS = {
  dark: "#09110d",
  light: "#f7f6ef",
};

export const UTM_PARAMS = {
  utm_source: new URL(baseUrl).hostname,
};
