import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import { ALI_HEADERS, IM_HEADERS, ROSTOV_HEADERS } from "./headers.fixture";
import { readTrackingWorkbook } from "./read";

const utcDay = (iso: string) => new Date(`${iso}T00:00:00Z`);

// A real .xlsx in memory: sheet name → rows (row 1 is the header)
async function workbook(sheets: Record<string, unknown[][]>) {
  const wb = new ExcelJS.Workbook();
  for (const [name, rows] of Object.entries(sheets)) {
    const ws = wb.addWorksheet(name);
    for (const row of rows) ws.addRow(row);
  }
  return Buffer.from(await wb.xlsx.writeBuffer());
}

describe("readTrackingWorkbook", () => {
  it("reads a Rostov file and reports a skipped row with its sheet and row", async () => {
    const file = await workbook({
      "Июль 26": [
        ROSTOV_HEADERS,
        [
          1,
          utcDay("2026-07-03"),
          20120349,
          "Отправитель",
          utcDay("2026-07-05"),
          "СДЕК",
          1234567890123,
        ],
        [2, null, 20210207], // no arrival date
        [3], // pre-numbered, no ТТН: not data
      ],
      Лист2: [], // a new empty sheet: ignored
    });

    expect(await readTrackingWorkbook(file)).toEqual({
      ok: true,
      kind: "rostov",
      rows: [
        {
          waybillNumber: "20120349",
          arrivalDate: utcDay("2026-07-03"),
          dispatchDate: utcDay("2026-07-05"),
          carrier: "СДЕК",
          carrierTrackNumber: "1234567890123",
        },
      ],
      report: {
        skippedRows: [{ sheet: "Июль 26", row: 3, text: "нет даты прибытия" }],
        problems: [],
        skippedSheets: [],
      },
    });
  });

  it("ignores ALI's empty «V» sheet with the ИМ layout", async () => {
    const promoRow = [
      null,
      null,
      null,
      null,
      null,
      "4153",
      null,
      null,
      300,
      null,
      utcDay("2024-06-25"),
    ];
    const result = await readTrackingWorkbook(
      await workbook({ ALI: [ALI_HEADERS, promoRow], V: [IM_HEADERS] }),
    );

    expect(result).toMatchObject({ ok: true, kind: "ali" });
  });

  it("refuses a file with Rostov and ALI data", async () => {
    const file = await workbook({
      "Июль 26": [ROSTOV_HEADERS, [1, utcDay("2026-07-03"), 20120349]],
      ALI: [ALI_HEADERS, [null, null, null, null, null, "4153"]],
    });

    expect(await readTrackingWorkbook(file)).toEqual({
      ok: false,
      reason: "mixed",
      sheetNames: ["Июль 26", "ALI"],
      error:
        "В файле листы разных типов (Ростов: «Июль 26»; ALI: «ALI»). Отправьте их отдельными файлами",
    });
  });

  it("reports a sheet with data under unknown headers", async () => {
    const file = await workbook({
      "Июль 26": [ROSTOV_HEADERS, [1, utcDay("2026-07-03"), 20120349]],
      Заметки: [["позвонить"], ["в среду"]],
    });

    expect(await readTrackingWorkbook(file)).toMatchObject({
      ok: true,
      kind: "rostov",
      report: { skippedSheets: [{ name: "Заметки", kind: null, dataRows: 1 }] },
    });
  });

  it("refuses something that isn't an xlsx", async () => {
    expect(await readTrackingWorkbook(Buffer.from("not excel"))).toEqual({
      ok: false,
      reason: "not-xlsx",
      sheetNames: [],
      error: "Это не Excel-файл (.xlsx): отправьте таблицу в формате .xlsx",
    });
  });

  it("throws on a truncated xlsx", async () => {
    const file = await workbook({
      "Июль 26": [ROSTOV_HEADERS, [1, utcDay("2026-07-03"), 20120349]],
    });

    await expect(readTrackingWorkbook(file.subarray(0, 200))).rejects.toThrow(
      "Не удалось прочитать файл",
    );
  });
});
