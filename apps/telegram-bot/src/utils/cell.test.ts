import { describe, expect, it } from "vitest";
import { cellDate, cellDay, cellText, plainValue } from "@/utils/cell";

describe("cellText", () => {
  it.each([
    [20210368, "20210368"], // ТТН typed as a number
    [1e21, "1000000000000000000000"], // huge: digits, not "1e+21"
    [" Донецк 2 ", "Донецк 2"],
    ["   ", null],
    [{ error: "#N/A" }, null], // broken formula
  ])("cellText(%j) → %j", (input, expected) => {
    expect(cellText(input)).toBe(expected);
  });
});

describe("cellDate", () => {
  it.each([
    [46303, "08.10.2026"], // Excel serial
    [46303.4894, "08.10.2026"], // time of day dropped
    [46022, "31.12.2025"], // year boundary
    [46023, "01.01.2026"],
    [0, "0"], // outside Excel's date range: kept as typed
    ["8.10.2026", "08.10.2026"], // day padded
    ["07,07,2025", "07.07.2025"], // commas → dots
    ["Дата", null], // placeholder = no date yet
    [" Дата выдачи ", null],
    ["   ", null],
    [{ error: "#N/A" }, null],
    ["удалена", "удалена"], // a note: kept as written
    ["02.11.20.26", "02.11.20.26"],
    ["08.10.2026 возврат", "08.10.2026 возврат"],
  ])("cellDate(%j) → %j", (input, expected) => {
    expect(cellDate(input)).toBe(expected);
  });
});

describe("cellDay", () => {
  // UTC midnight of a day: the shape a @db.Date column stores
  const day = (iso: string) => ({ kind: "day", day: new Date(`${iso}T00:00:00Z`) });
  const invalid = (text: string) => ({ kind: "invalid", text });
  const empty = { kind: "empty" };

  it.each([
    // Date cells (most of the files)
    [new Date("2020-09-01T00:00:00Z"), day("2020-09-01")],
    [new Date("2024-10-11T15:30:00Z"), day("2024-10-11")], // time dropped, day kept
    [new Date("garbage"), invalid("Invalid Date")],

    // Excel serials
    [46297, day("2026-10-02")],
    [46303.49, day("2026-10-08")],
    [0, invalid("0")], // outside Excel's date range
    [1e7, invalid("10000000")],

    // date text
    ["01,06,18", day("2018-06-01")], // Rostov 2018: commas, two-digit year
    ["20.03.18", day("2018-03-20")], // LNR 2018
    ["10.04.2018", day("2018-04-10")], // four-digit year: needs the $ anchor
    ["8.10.2026", day("2026-10-08")],

    // impossible dates: Date.UTC would roll them over
    ["29.02.2024", day("2024-02-29")], // leap year: real
    ["29.02.2025", invalid("29.02.2025")], // not a leap year
    ["31.02.2026", invalid("31.02.2026")],

    // text that isn't a date (real cells from the files)
    ["выдано", invalid("выдано")],
    ["21-25.10.2019", invalid("21-25.10.2019")],
    ["17.02.20 (26.12.2019)", invalid("17.02.20 (26.12.2019)")], // a date + junk
    ["201.1.1", invalid("201.1.1")],

    // no date yet
    [null, empty],
    ["", empty],
    ["   ", empty],
    ["Дата", empty],
    [{ error: "#N/A" }, empty],
  ])("cellDay(%j) → %j", (input, expected) => {
    expect(cellDay(input)).toEqual(expected);
  });
});

describe("plainValue", () => {
  it.each([
    [{ richText: [{ text: "LC30" }, { text: "4085" }] }, "LC304085"],
    [{ formula: "1050+1200", result: 2250 }, 2250],
    [{ formula: "2400-2400" }, null], // no cached result: can't evaluate
    [{ sharedFormula: "A1", result: 5 }, 5],
    [{ text: "ссылка", hyperlink: "https://example.com" }, "ссылка"],
    [{ error: "#N/A" }, null],
    ["abc", "abc"],
    [42, 42],
    [null, null],
  ])("plainValue(%j) → %j", (input, expected) => {
    expect(plainValue(input)).toEqual(expected);
  });
});
