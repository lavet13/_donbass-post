import { describe, expect, it } from "vitest";
import { ruCount } from "./plural";

const ROWS = { one: "строка", few: "строки", many: "строк" };

describe("ruCount", () => {
  it.each([
    [0, "0 строк"],
    [1, "1 строка"],
    [2, "2 строки"],
    [5, "5 строк"],
    [11, "11 строк"], // 11–14 are "many", despite ending in 1–4
    [21, "21 строка"],
    [22, "22 строки"],
    [21460, "21\u00a0460 строк"], // grouped with a non-breaking space
  ])("ruCount(%i) → %j", (n, expected) => {
    expect(ruCount(n, ROWS)).toBe(expected);
  });
});
