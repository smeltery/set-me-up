import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import postcss from "postcss";

const shared = postcss.parse(readFileSync("styles/set-me-up.css", "utf8"));
const marketing = postcss.parse(readFileSync("styles/marketing-theme.css", "utf8"));

function themeColors(dark: boolean) {
  const tokens: Record<string, string> = {};
  for (const [sheet, selectors] of [
    [shared, [":root", ...(dark ? [".dark"] : [])]],
    [marketing, [".marketing-content", ...(dark ? [".dark .marketing-content"] : [])]],
  ] as const) {
    for (const selector of selectors) {
      sheet.walkRules(selector, (rule) => {
        rule.walkDecls(/^--/, (declaration) => {
          tokens[declaration.prop] = declaration.value;
        });
      });
    }
  }
  function color(name: string): string {
    const value = tokens[name];
    if (!value) throw new Error(`Unknown theme color: ${name}`);
    const alias = value.match(/^var\((--[^)]+)\)$/);
    return alias ? color(alias[1]) : value;
  }
  return color;
}

function luminance(hex: string) {
  if (!/^#[\da-f]{6}$/i.test(hex)) throw new Error(`Expected an RGB color: ${hex}`);
  const [r, g, b] = [1, 3, 5].map((offset) => {
    const channel = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(first: string, second: string) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe("marketing theme accessibility", () => {
  for (const dark of [false, true]) {
    test(`${dark ? "dark" : "light"} text, controls, and code clear WCAG AA`, () => {
      const color = themeColors(dark);
      const pairs = [
        ["--foreground", "--background"],
        ["--muted-foreground", "--background"],
        ["--muted-foreground", "--card"],
        ["--primary-foreground", "--primary"],
        ["--secondary-foreground", "--secondary"],
        ["--accent-foreground", "--accent"],
        ["--code-foreground", "--code"],
        ...["--syntax-command", "--syntax-flag", "--syntax-value", "--syntax-operator"].flatMap(
          (token) => [
            [token, "--code"],
            [token, "--code-highlight"],
          ],
        ),
      ];
      for (const [ink, paper] of pairs) {
        expect(contrast(color(ink), color(paper)), `${ink} on ${paper}`).toBeGreaterThanOrEqual(
          4.5,
        );
      }
    });
  }
  test("layout styles cannot reintroduce fixed light or dark surfaces", () => {
    const layout = postcss.parse(readFileSync("styles/marketing.css", "utf8"));
    const fixedSurfaces: string[] = [];
    layout.walkDecls(/^(color|background|background-color)$/, (declaration) => {
      if (/#[\da-f]{3,8}\b/i.test(declaration.value)) fixedSurfaces.push(declaration.toString());
    });
    expect(fixedSurfaces).toEqual([]);
  });
});
