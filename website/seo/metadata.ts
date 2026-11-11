import type { Metadata } from "next";

import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { homeContentRoute } from "@/lib/docs";

interface CreatePageMetadataOptions {
  description?: string;
  /**
   * Markdown mirror for a page the proxy doesn't know. Docs pages, the home
   * page, /studio, /backgrounds and the trust pages get theirs automatically.
   */
  markdownPath?: string;
  noIndex?: boolean;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogTitle?: string;
  ogType?: "article" | "website";
  path: string;
  title: string;
}

/** The `.md` twin the proxy serves for `canonical`, if it has one. */
const defaultMarkdownPath = (canonical: string): string | undefined => {
  if (canonical === ROUTES.HOME) {
    return homeContentRoute;
  }
  if (canonical === ROUTES.DOCS || canonical.startsWith(`${ROUTES.DOCS}/`)) {
    return `${canonical}.md`;
  }
  return undefined;
};

export const createPageMetadata = ({
  description,
  markdownPath,
  noIndex = false,
  ogDescription,
  ogImage,
  ogImageAlt,
  ogTitle,
  ogType = "website",
  path,
  title,
}: CreatePageMetadataOptions): Metadata => {
  const canonical = path.startsWith(ROUTES.HOME)
    ? path
    : `${ROUTES.HOME}${path}`;
  const markdownAlternate = markdownPath ?? defaultMarkdownPath(canonical);
  const resolvedOgImage = ogImage ?? SITE.OG_IMAGE;
  const resolvedTitle = ogTitle ?? title;

  return {
    alternates: {
      canonical,
      ...(markdownAlternate && {
        types: {
          "text/markdown": markdownAlternate,
        },
      }),
    },
    description,
    openGraph: {
      description: ogDescription ?? description,
      images: [
        {
          alt: ogImageAlt ?? resolvedTitle,
          height: 630,
          url: resolvedOgImage,
          width: 1200,
        },
      ],
      locale: "en_US",
      siteName: SITE.NAME,
      title: resolvedTitle,
      type: ogType,
      url: `${SITE.URL}${canonical}`,
    },
    title,
    twitter: {
      card: "summary_large_image",
      description: ogDescription ?? description,
      images: [resolvedOgImage],
      title: resolvedTitle,
    },
    ...(noIndex
      ? {
          robots: {
            follow: false,
            index: false,
          },
        }
      : {}),
  };
};

export const baseMetadata: Metadata = {
  alternates: {
    canonical: ROUTES.HOME,
    types: {
      "text/markdown": homeContentRoute,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE.NAME,
  },
  applicationName: SITE.NAME,
  authors: [{ name: SITE.AUTHOR.NAME, url: SITE.AUTHOR.URL }],
  category: "technology",
  creator: SITE.AUTHOR.NAME,
  description: SITE.DESCRIPTION.LONG,
  icons: { icon: "/favicon.svg" },
  keywords: [...SITE.KEYWORDS],
  metadataBase: new URL(SITE.URL),
  openGraph: {
    description: SITE.DESCRIPTION.LONG,
    images: [
      {
        alt: SITE.NAME,
        height: 630,
        url: SITE.OG_IMAGE,
        width: 1200,
      },
    ],
    locale: "en_US",
    siteName: SITE.NAME,
    title: SITE.NAME,
    type: "website",
    url: SITE.URL,
  },
  // Picks the default view on is-agentic.com reports; it doesn't change the score.
  other: {
    "is-agentic-site-type": "content",
  },
  publisher: SITE.AUTHOR.NAME,
  title: {
    default: `${SITE.NAME} - ${SITE.DESCRIPTION.SHORT}`,
    template: `%s | ${SITE.NAME}`,
  },
  twitter: {
    card: "summary_large_image",
    description: SITE.DESCRIPTION.LONG,
    images: [SITE.OG_IMAGE],
    title: SITE.NAME,
  },
};
