import { describe, expect, it } from "vitest";
import { parseShipments } from "@/cargo-tracking/parse";
import ExcelJS from "exceljs";

describe("parseShipments", () => {
  it("parses a data row and skips header, junk and blank rows", () => {
    // ExcelJS can build a worksheet in memory
    const ws = new ExcelJS.Workbook().addWorksheet("Ведомость грузов");
    ws.addRow([1]);
    ws.addRow(["Дата приема", "Город", "Город", "№ ТТН", "Трек №", "Дата"]);
    ws.addRow([
      46303,
      "Горловка",
      "Москва",
      20210368,
      "44А, 20А",
      "08.10.2026",
    ]);
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
});
