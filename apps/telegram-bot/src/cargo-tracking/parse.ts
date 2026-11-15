import type ExcelJS from "exceljs";
import type { Prisma } from "@/lib/prisma/client";
import { cellDate, cellText } from "@/utils/cell";

/**
 * Worksheet -> clean rows for the cargo tables. Pure: no database, no Telegram,
 * so everything here is unit-testable with an in-memory ExcelJS worksheet.
 */

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
