import { expect, test } from "bun:test";
import { createRestDraw } from "../lib/ascii-rest-frame";
import { MutableFrame } from "../lib/ascii/frame";
import type { AsciiGridDrawContext } from "../lib/ascii/grid";

const meta = { name: "fixture", category: "scenes", note: "", cols: 2, rows: 2, cell: 1, fps: 15, palette: ["#123456", "#abcdef"] } as const;
const context = (frame: MutableFrame, time = 6) => ({ frame, columns: frame.columns, rows: frame.rows, time, metrics: { width: 1, height: 1 } }) as AsciiGridDrawContext;

test("the bridge preserves native glyphs, palette indices, time and paper mode", () => {
  const draw = createRestDraw((time, env) => {
    expect(time).toBe(6);
    expect(env?.paper).toBe(true);
    env!.color!.set([0, 1, 1, 0]);
    return "AB\nCD";
  }, meta, { paper: true });
  const frame = new MutableFrame(2, 2, { color: true });
  draw(context(frame));
  expect(frame.glyphs.join("")).toBe("ABCD");
  expect(Array.from(frame.colors!.slice(4, 8))).toEqual([171, 205, 239, 255]);
});

test("cover fills a wide viewport; contain keeps the complete composition centered", () => {
  const frame = new MutableFrame(4, 2);
  createRestDraw(() => "AB\nCD", meta)(context(frame));
  expect(frame.glyphs.join("")).toBe("AABBCCDD");
  frame.clear();
  createRestDraw(() => "AB\nCD", meta, { contain: true })(context(frame));
  expect(frame.glyphs.join("")).toBe(" AB  CD ");
});
