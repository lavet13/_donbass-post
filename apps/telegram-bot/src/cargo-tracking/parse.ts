import type ExcelJS from "exceljs";
import type { Prisma } from "@/lib/prisma/client";

/**
 * Worksheet -> clean rows for the cargo tables. Pure: no database, no Telegram,
 * so everything here is unit-testable with an in-memory ExcelJS worksheet.
 */

/**
 * Cleans a cell from a text column (ТТН, cities, tracks, points) into a
 * trimmed string or null. ТТН and tracks often arrive as numbers, so numbers
 * are converted, not dropped. Anything else (an empty cell, ExcelJS's
 * { error: "#N/A" } for a broken formula) → null.
 */
export function cellText(value: unknown): string | null {
  // Guard clause: It’s not about rejecting numbers and strings. It rejects everything else
  // After the condition: everything below it only ever sees numbers and strings.
  if (typeof value !== "number" && typeof value !== "string") return null;

  // Whole numbers print as plain digits even when huge: String(1e21) is "1e+21",
  // BigInt(1e21).toString() is all digits. BigInt() throws on non-integers
  // (RangeError), hence the isInteger check first.
  const raw =
    typeof value === "number" && Number.isInteger(value)
      ? BigInt(value).toString()
      : String(value);
  const text = raw.trim();
  return text === "" ? null : text;
}

// Words that mean "no date yet" — they become null, not text
const DATE_PLACEHOLDERS = new Set(["Дата", "Дата выдачи"]); // Set.has = exact-match lookup

/**
 * Cleans a cell from a date column into what the customer should see:
 *   - Excel serial number (46303, 46303.49…) → "08.10.2026". The fraction is a
 *     time of day and is dropped: everything is displayed as DD.MM.YYYY.
 *   - date text "8.10.2026" / "07,07,2025" → "08.10.2026" / "07.07.2025"
 *     (1-digit day/month padded, commas → dots).
 *   - empty cell, "Дата" / "Дата выдачи" placeholders, { error } → null:
 *     "no date yet". cargoStatusMessage relies on this to tell "выдан" from
 *     "ожидает".
 *   - any other text ("испорчено", "удалена", "08.10.2026 возврат…") is a note
 *     for the customer, returned as written.
 * Only valid on date columns: the same number in a ТТН column is not a date.
 */
export function cellDate(value: unknown): string | null {
  if (typeof value === "number") {
    // Outside Excel's date range (1 … 2958465 = 31.12.9999) it's not a date:
    // keep what was typed rather than inventing the year 57233
    if (value < 1 || value > 2_958_465) return cellText(value);

    // Excel counts days from 1899-12-30 (not 1900-01-01: that offset absorbs
    // Excel's fake leap day 29.02.1900). 86_400_000 = ms per day.
    const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(value) * 86_400_000);
    // read it back with getUTCDate/getUTCMonth/getUTCFullYear, never getDate etc.:
    // the local-time getters shift by the server's timezone and can change the day

    return `${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${d.getUTCFullYear()}`;
  }

  const text = cellText(value);

  if (text === null || DATE_PLACEHOLDERS.has(text)) return null;

  const match = text.match(/^(\d{1,2})[.,](\d{1,2})[.,](\d{4})$/);
  if (!match) return text; // not a date → a note ("испорчено", "08.10.2026 возврат…"): keep it

  const [day, month, year] = match.slice(1);
  return `${day?.padStart(2, "0")}.${month?.padStart(2, "0")}.${year}`;
}

/**
 * Sheet «Ведомость грузов» -> one row per shipment. Columns: 1 Дата приема,
 * 2 Город отправления, 3 Город получения, 4 № ТТН, 5 Трек №, 6 Дата отправки.
 * Track cells can hold several tracks ("44А, 20А"); searchCargo matches inside them.
 */
export function parseShipments(ws: ExcelJS.Worksheet) {
  return parseSheet<Prisma.CargoShipmentCreateManyInput>(
    ws,
    4,
    (row, waybillNumber) => ({
      receptionDate: cellDate(row.getCell(1).value), // Дата приема
      departureCity: cellText(row.getCell(2).value),
      destinationCity: cellText(row.getCell(3).value),
      waybillNumber, // № ТТН
      trackNumber: cellText(row.getCell(5).value),
      departureDate: cellDate(row.getCell(6).value),
    }),
  );
}

/**
 * Sheet «СВХ ведомости» -> one row per stop at a sorting point (a parcel can have
 * several). Columns: 1 № ТТН, 2 Город отправитель, 3 Город получатель,
 * 4 Дата прибытия на СВХ, 5 Дата отправления, 6 point name.
 */
export function parseWarehouseMovements(ws: ExcelJS.Worksheet) {
  return parseSheet<Prisma.CargoWarehouseMovementCreateManyInput>(
    ws,
    1,
    (row, waybillNumber) => ({
      waybillNumber,
      departureCity: cellText(row.getCell(2).value),
      destinationCity: cellText(row.getCell(3).value),
      arrivalDate: cellDate(row.getCell(4).value),
      departureDate: cellDate(row.getCell(5).value),
      warehousePoint: cellText(row.getCell(6).value),
    }),
  );
}

/**
 * Sheet «Учет прибывших» -> arrival at the pickup point and hand-over to the
 * recipient. Columns: 1 Дата прибытия, 2 № ТТН, 3 Дата выдачи, 4 Город выдачи.
 * A ТТН can appear in more than one uploaded month; searchCargo picks between them.
 */
export function parseDeliveryRecords(ws: ExcelJS.Worksheet) {
  return parseSheet<Prisma.CargoDeliveryRecordCreateManyInput>(
    ws,
    2,
    (row, waybillNumber) => ({
      arrivalDate: cellDate(row.getCell(1).value),
      waybillNumber,
      deliveryDate: cellDate(row.getCell(3).value),
      deliveryCity: cellText(row.getCell(4).value),
    }),
  );
}

// A real ТТН is exactly 8 digits. This one check skips blank rows (null),
// the header repeated per city block ("№ ТТН") and the stray "1" in СВХ row 1.
// No g flag: .test() on a g regex remembers lastIndex between calls.
const TTN_PATTERN = /^\d{8}$/;

/**
 * The loop shared by all three parsers: visits every row, keeps only rows whose
 * ТТН cell (ttnColumn, 1-based like ExcelJS's getCell) holds an 8-digit ТТН,
 * and lets toRow turn each kept row into one object. eachRow already skips
 * rows with no values, so the ~50,000 pre-formatted empty rows cost nothing.
 */
function parseSheet<T>(
  ws: ExcelJS.Worksheet,
  ttnColumn: number,
  toRow: (row: ExcelJS.Row, waybillNumber: string) => T, // builds one object per data row
): T[] {
  const rows: T[] = [];

  ws.eachRow((row) => {
    const waybillNumber = cellText(row.getCell(ttnColumn).value);
    if (waybillNumber === null || !TTN_PATTERN.test(waybillNumber)) return; // `return` here = skip this row

    rows.push(toRow(row, waybillNumber));
  });

  return rows;
}
