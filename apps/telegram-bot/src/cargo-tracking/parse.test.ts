import { describe, expect, it } from "vitest";
import { cellDate, cellText, parseShipments } from "./parse";
import ExcelJS from "exceljs";

describe("cellDate", () => {
  // [input, expected]: each row becomes its own test; each %j in the name is
  // replaced by that row's values, printed as JSON
  it.each([
    [46303, "08.10.2026"],
    [46303.4894, "08.10.2026"], // time of day dropped
    [46022, "31.12.2025"],
    [46023, "01.01.2026"],
    ["8.10.2026", "08.10.2026"],
    ["07,07,2025", "07.07.2025"],
    ["Дата", null], // placeholder = no date yet
    [" Дата выдачи ", null],
    ["   ", null],
    [{ error: "#N/A" }, null],
    ["удалена", "удалена"],
    ["02.11.20.26", "02.11.20.26"],
    ["08.10.2026 возврат", "08.10.2026 возврат"],
  ])("cellDate(%j) -> %j", (input, expected) => {
    expect(cellDate(input)).toBe(expected);
  });
});

describe("cellText", () => {
  it.each([
    [20210368, "20210368"], // ТТН arrive as numbers
    [1e21, "1000000000000000000000"], // fails if the BigInt line is "simplified" away
    [" Донецк 2 ", "Донецк 2"],
    ["   ", null],
    [{ error: "#N/A" }, null],
  ])("cellText(%j) -> %j", (input, expected) => {
    expect(cellText(input)).toBe(expected);
  });
});

describe("parseShipments", () => {
  it("parses a data row and skips header, junk and blank rows", () => {
    // ExcelJS can build a worksheet in memory
    const ws = new ExcelJS.Workbook().addWorksheet("Ведомость грузов");
    ws.addRow([1]);
    ws.addRow(["Дата приема", "Город", "Город", "№ ТТН", "Трек №", "Дата"]);
    ws.addRow([46303, "Горловка", "Москва", 20210368, "44А, 20А", "08.10.2026"]);
    expect(parseShipments(ws)).toEqual([
      {
        receptionDate: "08.10.2026",
        departureCity: "Горловка",
        destinationCity: "Москва",
        waybillNumber: "20210368",
        trackNumber: "44А, 20А", // fails with the missing .value
        departureDate: "08.10.2026",
      },
    ]);
  });
})
