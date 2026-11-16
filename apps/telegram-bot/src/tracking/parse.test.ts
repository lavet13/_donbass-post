import ExcelJS from "exceljs";
import type { Row, CellValue } from "exceljs";
import { describe, it, expect } from "vitest";
import {
  cellWaybill,
  decideFileKind,
  detectKind,
  fillStatus,
  findColumns,
  parseLnrRow,
  parsePromoRow,
  parseRostovRow,
  promoCodes,
  SPECS,
  type SheetSummary,
} from "./parse";

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

const ROSTOV_HEADERS = [
  "№ пп",
  "Дата прибытия",
  "№ ТТН",
  "опл/ неопл, внутр, ИМ",
  "Дата выдачи, пересылки",
  "Отпралено Др дост",
  "Трек, индификатор, код чека",
  "ФИО получателя",
  "Телефон получателя",
  "Дата  уведомл получ СМС",
  "ФИО отправителя",
  "Телефон отправителя",
];

const LNR_HEADERS = [
  "№ пп",
  "Дата прибытия",
  "№ ТТН",
  "опл/ неопл/ част.опл.",
  'Дата передачи     (в "НП")',
  'Итого сумма по ТТН "НП"',
  "Итого к оплате получателем",
  'Исполнитель передачи груза ("НП")',
  'Дата передачи (в "ПЛ")',
  'Место передачи груза ("ПЛ")',
  "Населенный пункт выдачи груза",
  '№ декларации "ПЛ"',
  "Сумма доставки",
];

const ALI_HEADERS = [
  "ДАТА ЗАКАЗА",
  "ССЫЛКА ЗАКАЗА",
  "№ ЗАКАЗА",
  "ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ",
  "ДАТА ОФОРМЛЕНИЯ",
  "ПРОМОКОД",
  "№ ТТН ИЗ ЛДНР",
  "СУММА В ПУТИ",
  "СУММА В ТТН",
  "СУММА НА ЗАКАЗ ИНФО ДЛЯ 3%",
  "дата",
  "ОПЛАТА БЕЗНАЛ",
  "СУММА ИТОГО",
  "ДАТА",
  "№ ТТН из ЛДНР (НАЛОЖКА)",
  "СУММА",
  "ДАТА",
  "НОМЕР ВОЗВРАТНОЙ ТТН",
  "СУММА",
  "ДАТА",
  "доставщик",
  "идентификатор",
];

const IM_HEADERS = [
  "ДАТА ЗАКАЗА",
  "ОТКУДА ЗАКАЗ",
  "№ ЗАКАЗА",
  "ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ",
  "ДАТА ОФОРМЛЕНИЯ",
  "ПРОМОКОД",
  "№ ТТН ИЗ ЛДНР",
  "СУММА В ПУТИ",
  "СУММА В ТТН",
  "СУММА НА ЗАКАЗ ИНФО ДЛЯ 1,5%",
  "дата",
  "ОПЛАТА БЕЗНАЛ",
  "ОПЛАТА НАЛ",
  "ДРУГИЕ ДОСТАВЩИКИ",
  "СУММА ИТОГО",
  "ДАТА",
  "№ ТТН ЗИ ЛДНР (НАЛОЖКА)",
  "СУММА",
  "ДАТА",
  "НОМЕР ВОЗВРАТНОЙ ТТН",
  "СУММА",
  "ДАТА",
  "доставщик",
  "идентификатор",
];

describe("detectKind", () => {
  it.each([
    { headers: ROSTOV_HEADERS, kind: "rostov" },
    { headers: LNR_HEADERS, kind: "lnr" },
    { headers: ALI_HEADERS, kind: "ali" },
    { headers: IM_HEADERS, kind: "im" },
  ])("detects the $kind header row", ({ headers, kind }) => {
    const row = headerRow(...headers);
    expect(detectKind(row)).toBe(kind);
  });

  it("returns null for a promo row without its ALI marker", () => {
    const withoutMarker = ALI_HEADERS.filter((h) => h !== "ССЫЛКА ЗАКАЗА");
    expect(detectKind(headerRow(...withoutMarker))).toBeNull();
  });

  it("returns null for a promo row without its IM marker", () => {
    const withoutMarker = IM_HEADERS.filter((h) => h !== "ОТКУДА ЗАКАЗ");
    expect(detectKind(headerRow(...withoutMarker))).toBeNull();
  });

  it("returns null for an empty header row", () => {
    expect(detectKind(headerRow())).toBeNull();
  });
});

describe("decideFileKind", () => {
  it("ignores an empty sheet with another layout", () => {
    const sheets: SheetSummary[] = [
      { name: "ALI", kind: "ali", dataRows: 859 },
      { name: "V", kind: "im", dataRows: 0 }, // ИМ layout, but empty: must not vote
    ];

    expect(decideFileKind(sheets)).toEqual({
      ok: true,
      kind: "ali",
      skipped: [],
    });
  });

  it("refuses a file whose data sheets are of different kinds", () => {
    const sheets: SheetSummary[] = [
      { name: "август 23", kind: "ali", dataRows: 37 },
      { name: "Июль 26", kind: "rostov", dataRows: 5 },
      { name: "ALI", kind: "ali", dataRows: 3 },
    ];

    expect(decideFileKind(sheets)).toEqual({
      ok: false,
      error:
        "В файле листы разных типов (ALI: «август 23», «ALI»; Ростов: «Июль 26»). Отправьте их отдельными файлами",
    });
  });

  it("refuses a file with no data rows on any sheet", () => {
    expect(
      decideFileKind([{ name: "Лист1", kind: null, dataRows: 0 }]),
    ).toEqual({
      ok: false,
      error:
        "Не удалось определить тип файла: ни один лист не похож на Ростов, ЛНР, ALI или ИМ",
    });
  });

  it("returns sheets with data but an unknown layout in skipped", () => {
    const notes: SheetSummary = { name: "Заметки", kind: null, dataRows: 2 };

    expect(
      decideFileKind([{ name: "Июль 26", kind: "rostov", dataRows: 5 }, notes]),
    ).toEqual({ ok: true, kind: "rostov", skipped: [notes] });
  });
});

describe("cellWaybill", () => {
  it.each([
    [20120349, "20120349"], // typed as a number
    ["20120349", "20120349"],
    ["21302284 А", "21302284"], // letter after it
    ["21400464Д", "21400464"], // LNR suffix, no space
    ["52600001/3", "52600001"], // piece 3 of a multi-piece shipment
    ["21900459 (23500013)", "21900459"], // two numbers: the first one
    ["123456789", null], // 9 digits: not cut down to 8
    ["2130228", null], // 7 digits
    [null, null],
    ["   ", null],
  ])("cellWaybill(%j) → %j", (input, expected) => {
    expect(cellWaybill(input)).toBe(expected);
  });
});

describe("promoCodes", () => {
  it.each([
    [129803, ["129803"]], // typed as a number
    ["129811  129812", ["129811", "129812"]],
    ["4412/4414", ["4412", "4414"]],
    ["A-177(3386,3387,3388,3389)", ["3386", "3387", "3388", "3389"]], // not «177»
    ["(4385) 4386 (4387)", ["4385", "4386", "4387"]],
    ["127665/66", ["127665"]], // the shortened second code is lost, as agreed
    ["5244, 5244", ["5244"]], // written twice: stored once
    ["БЕЗ", []],
    [null, []],
  ])("promoCodes(%j) → %j", (input, expected) => {
    expect(promoCodes(input)).toEqual(expected);
  });
});

describe("fillStatus", () => {
  // A ПРОМОКОД cell, optionally with a solid fill of the given colour
  function filledCell(fgColor?: { argb: string } | { theme: number }) {
    const cell = new ExcelJS.Workbook()
      .addWorksheet("test")
      .addRow(["129803"])
      .getCell(1);
    if (fgColor) cell.fill = { type: "pattern", pattern: "solid", fgColor };
    return cell;
  }

  it.each([
    ["FFFFC000", "ORDER_PLACED"], // orange
    ["FFFFFF00", "SHIPPED_BY_STORE"], // yellow
    ["FF00B0F0", "PROCESSED_IN_ROSTOV"], // blue
    ["FF92D050", "DELIVERED"], // green
    ["FF00B050", "DELIVERED"], // darker green from the ИМ archive
    ["FFFF0000", "CANCELLED"], // red
  ])("maps fill %s to %s", (argb, status) => {
    expect(fillStatus(filledCell({ argb }))).toBe(status);
  });

  it("returns null for a cell without a fill", () => {
    expect(fillStatus(filledCell())).toBeNull();
  });

  it("returns null for a colour that isn't in the legend", () => {
    expect(fillStatus(filledCell({ argb: "FF123456" }))).toBeNull();
  });

  it("returns null for a theme colour, which has no ARGB", () => {
    expect(fillStatus(filledCell({ theme: 5 }))).toBeNull();
  });
});

// A sheet with the given header row; row({ 3: 20120349 }) adds a data row
// with those cells filled (column number → value), everything else empty.
function sheet(headers: string[]) {
  const ws = new ExcelJS.Workbook().addWorksheet("test");
  const header = ws.addRow(headers);
  const row = (cells: Record<number, CellValue>) => {
    const r = ws.addRow([]);
    for (const [column, value] of Object.entries(cells))
      r.getCell(Number(column)).value = value;
    return r;
  };
  return { header, row };
}

// The columns of a spec, or a thrown error: a test whose headers don't match
// is a broken test, not a case to assert on.
function mustFind<K extends string>(header: Row, spec: Record<K, string>) {
  const result = findColumns(header, spec);
  if (!result.ok) throw new Error(`test setup: ${JSON.stringify(result)}`);
  return result.columns;
}

const utcDay = (iso: string) => new Date(`${iso}T00:00:00Z`);

describe("parseRostovRow", () => {
  const { header, row } = sheet(ROSTOV_HEADERS);
  const columns = mustFind(header, SPECS.rostov);

  it("parses a full row", () => {
    expect(
      parseRostovRow(
        row({ 1: 1, 2: utcDay("2026-07-03"), 3: 20120349, 4: "Отправитель", 5: utcDay("2026-07-05"), 6: "СДЕК", 7: 1234567890123 }),
        columns,
      ),
    ).toEqual({
      ok: true,
      problems: [],
      data: {
        waybillNumber: "20120349",
        arrivalDate: utcDay("2026-07-03"),
        dispatchDate: utcDay("2026-07-05"),
        carrier: "СДЕК",
        carrierTrackNumber: "1234567890123",
      },
    });
  });

  it("returns null for a pre-numbered row without a ТТН", () => {
    expect(parseRostovRow(row({ 1: 57 }), columns)).toBeNull();
  });

  it.each([
    [{ 2: utcDay("2026-07-03"), 3: 5200006 }, "в «№ ТТН» нет номера из 8 цифр: «5200006»"],
    [{ 3: 20120349 }, "нет даты прибытия"],
    [{ 2: "23,.02.2019", 3: 20120349 }, "дата прибытия «23,.02.2019» не распознана"],
  ])("skips %j: %s", (cells, reason) => {
    expect(parseRostovRow(row(cells), columns)).toEqual({ ok: false, reason });
  });

  it("imports a 2018 row and reports an unreadable dispatch date", () => {
    expect(
      parseRostovRow(row({ 2: "01,06,18", 3: "21302284 А", 5: "выдано", 6: "выдан" }), columns),
    ).toEqual({
      ok: true,
      problems: ["дата выдачи «выдано» не распознана, сохранено без даты"],
      data: {
        waybillNumber: "21302284",
        arrivalDate: utcDay("2018-06-01"),
        dispatchDate: null,
        carrier: "выдан",
        carrierTrackNumber: null,
      },
    });
  });
});

describe("parseLnrRow", () => {
  const { header, row } = sheet(LNR_HEADERS);
  const columns = mustFind(header, SPECS.lnr);

  it("parses a row with a suffixed ТТН and a numeric declaration", () => {
    expect(
      parseLnrRow(
        row({ 3: "21400464Д", 9: utcDay("2021-05-12"), 11: "294013, Кременная", 12: 29103483001719 }),
        columns,
      ),
    ).toEqual({
      ok: true,
      problems: [],
      data: {
        waybillNumber: "21400464",
        handoverDate: utcDay("2021-05-12"),
        deliveryAddress: "294013, Кременная",
        declarationNumber: "29103483001719",
      },
    });
  });
});

describe("parsePromoRow", () => {
  const { header, row } = sheet(ALI_HEADERS);
  const columns = mustFind(header, SPECS.ali);

  it("parses a row with a formula amount, a rich-text track and a fill", () => {
    const r = row({
      6: "4412/4414",
      9: { formula: "1050+1200", result: 2250 },
      11: utcDay("2024-06-25"),
      22: { richText: [{ text: "LC304085044CN " }, { text: "LP00660399782675" }] },
    });
    r.getCell(6).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF92D050" } };

    expect(parsePromoRow(r, columns, "ALI")).toEqual({
      ok: true,
      problems: [],
      data: {
        source: "ALI",
        promoCodes: ["4412", "4414"],
        promoCodeRaw: "4412/4414",
        amountPaid: "2250.00",
        paymentDate: utcDay("2024-06-25"),
        trackNumber: "LC304085044CN LP00660399782675",
        status: "DELIVERED",
      },
    });
  });

  it("stores a formula without a cached result as no amount", () => {
    expect(parsePromoRow(row({ 6: 5240, 9: { formula: "2400-2400" } }), columns, "ALI")).toEqual({
      ok: true,
      problems: [],
      data: {
        source: "ALI",
        promoCodes: ["5240"],
        promoCodeRaw: "5240",
        amountPaid: null,
        paymentDate: null,
        trackNumber: null,
        status: null,
      },
    });
  });

  it("skips a row whose ПРОМОКОД has no code", () => {
    expect(parsePromoRow(row({ 6: "БЕЗ", 9: 1000 }), columns, "ALI")).toEqual({
      ok: false,
      reason: "в «ПРОМОКОД» нет кода из 4+ цифр: «БЕЗ»",
    });
  });

  it("returns null for a legend row at the bottom of the sheet", () => {
    expect(parsePromoRow(row({ 2: "заказ закрыт полностью" }), columns, "ALI")).toBeNull();
  });
});
