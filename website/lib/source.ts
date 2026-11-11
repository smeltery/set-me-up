import type { Root, Item } from "fumadocs-core/page-tree";
import index from "@/content-data/search.json";
import { documentationOrigin } from "@/lib/documentation";
const groups = [
  ["Start here", "(root)"],
  ["Guides", "guides"],
  ["Operations", "operations"],
  ["Reference", "reference"],
];
const pages = index.map((page) => ({
  url: documentationOrigin + page.path,
  data: { title: page.title, description: page.description },
}));
export const source = {
  pageTree: {
    name: "Documentation",
    children: groups.map(([name, id]) => ({
      type: "folder",
      name,
      $id: id,
      children: index
        .filter(
          (page) => page.group === name || (name === "Start here" && page.group === "Start here"),
        )
        .map((page) => ({ type: "page", name: page.title, url: documentationOrigin + page.path })),
    })),
  } as Root,
  getPages: () => pages,
  getNodePage: (item: Item) =>
    item.type === "page" ? pages.find((page) => page.url === item.url) : undefined,
};
