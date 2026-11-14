import ExcelJS from "exceljs";
import { describe, it, expect } from "vitest";
import { findColumns } from "./parse";

function headerRow(...headers: (string | null)[]) {
  return new ExcelJS.Workbook().addWorksheet("test").addRow(headers);
}

describe("findColumns", () => {
  it("finds each field's column wherever it sits", () => {
    // addRow puts the first argument in column 1 (A), the second in 2 (B), ...
    // The null leaves column 3 empty, so the test also checks that empty cells don't shift the numbering.
    const row = headerRow("Трек", "№ ТТН", null, "Дата прибытия");

    expect(
      findColumns(row, {
        waybillNumber: "№ ТТН",
        arrivalDate: "Дата прибытия",
      }),
    ).toEqual({
      ok: true,
      columns: { waybillNumber: 2, arrivalDate: 4 },
    });
  });

  it.each([
    'Дата передачи     (в "ПЛ")', // extra spaces
    'Дата передачи\n(в "ПЛ")', // Alt+Enter line break
    '  Дата передачи (в "ПЛ") ', // spaces at the ends
  ])("matches the spec despite whitespace: %j", (header) => {
    const row = headerRow(header);

    expect(
      findColumns(row, { handoverDate: 'Дата передачи (в "ПЛ")' }),
    ).toEqual({
      ok: true,
      columns: { handoverDate: 1 },
    });
  });

  it("keeps case: «дата» is not «ДАТА»", () => {
    const row = headerRow("ДАТА", "дата", "ДАТА");

    expect(
      findColumns(row, {
        paymentDate: "дата",
      }),
    ).toEqual({
      ok: true,
      columns: { paymentDate: 2 },
    });
  });

  it("reports a missing header by its spec text, even when others were found", () => {
    const row = headerRow("№ ТТН", "Дата прибытия");

    expect(
      findColumns(row, {
        waybillNumber: "№ ТТН", // found
        declarationNumber: '№  декларации "ПЛ"', // not in the row; note the double space
      }),
    ).toEqual({
      ok: false,
      missing: ['№  декларации "ПЛ"'],
      ambiguous: [],
    });
  });

  it("reports an ambiguity of the headers by its spec text", () => {
    const row = headerRow("ДАТА", "дата", "ДАТА");

    expect(
      findColumns(row, {
        paymentDate: "ДАТА",
      }),
    ).toEqual({
      ok: false,
      ambiguous: [{ header: "ДАТА", columns: [1, 3] }],
      missing: [],
    });
  });
});
