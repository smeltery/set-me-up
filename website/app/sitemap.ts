import type { MetadataRoute } from "next";
import { SITE } from "@/constants/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE.URL, changeFrequency: "monthly", priority: 1 }];
}
