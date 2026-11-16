import { describe, expect, it } from "vitest";
import { trackingPeriod, type ReadyWorkbook } from "./period";

const utcDay = (iso: string) => new Date(`${iso}T00:00:00Z`);
const report = { skippedRows: [], problems: [], skippedSheets: [] };
const lnrRow = (handoverDate: Date | null) => ({
  waybillNumber: "26503355",
  handoverDate,
});

describe("trackingPeriod", () => {
  it("spans the earliest to the latest date, whatever the row order", () => {
    const workbook: ReadyWorkbook = {
      ok: true,
      kind: "lnr",
      rows: [
        lnrRow(utcDay("2024-05-01")),
        lnrRow(utcDay("2018-03-20")),
        lnrRow(utcDay("2026-07-28")),
      ],
      report,
    };
    expect(trackingPeriod(workbook)).toEqual({
      from: utcDay("2018-03-20"),
      to: utcDay("2026-07-28"),
    });
  });

  it("ignores rows without a date", () => {
    const workbook: ReadyWorkbook = {
      ok: true,
      kind: "lnr",
      rows: [lnrRow(null), lnrRow(utcDay("2024-05-01"))],
      report,
    };
    expect(trackingPeriod(workbook)).toEqual({
      from: utcDay("2024-05-01"),
      to: utcDay("2024-05-01"),
    });
  });

  it("returns null when no row has a date", () => {
    const workbook: ReadyWorkbook = {
      ok: true,
      kind: "lnr",
      rows: [lnrRow(null)],
      report,
    };
    expect(trackingPeriod(workbook)).toBeNull();
  });
});
