/* Uploaded file -> workbook -> parse* -> one database transaction */
import type { Prisma } from "@/lib/prisma/client";
import ExcelJS from "exceljs";
import {
  parseDeliveryRecords,
  parseShipments,
  parseWarehouseMovements,
} from "@/cargo-tracking/parse";

// PERF: ExcelJS's readFile builds the WHOLE workbook in memory before we see a
// single row: measured ~1.1 s and ~216 MB heap for one «Отслеживание» file
// (3 sheets × 50,000 pre-formatted rows, ~1,200 of them with data). Fine for a
// few uploads a day. If memory becomes a problem on the VPS, switch to the
// streaming reader (ExcelJS.stream.xlsx.WorkbookReader): rows arrive one at a
// time and memory stays low.

/**
 * Loads one uploaded «Отслеживание» workbook and parses its three sheets.
 * Throws if a sheet is missing (a wrong file was sent): the bot shows that
 * message to the manager, and the file is never added to the upload.
 */
export async function readCargoWorkbook(buffer: Buffer): Promise<{
  shipments: Prisma.CargoShipmentCreateManyInput[];
  movements: Prisma.CargoWarehouseMovementCreateManyInput[];
  deliveries: Prisma.CargoDeliveryRecordCreateManyInput[];
}> {
  const wb = new ExcelJS.Workbook();

  await wb.xlsx.load(buffer);

  const shipmentsSheet = wb.getWorksheet("Ведомость грузов");
  if (!shipmentsSheet) {
    throw new Error(
      'В файле Отслеживание отсутствует лист "Ведомость грузов" ',
    );
  }

  const movementsSheet = wb.getWorksheet("СВХ ведомости");
  if (!movementsSheet) {
    throw new Error('В файле Отслеживание отсутствует лист "СВХ ведомости" ');
  }

  const deliveriesSheet = wb.getWorksheet("Учет прибывших");
  if (!deliveriesSheet) {
    throw new Error('В файле Отслеживание отсутствует лист "Учет прибывших"');
  }

  return {
    shipments: parseShipments(shipmentsSheet),
    movements: parseWarehouseMovements(movementsSheet),
    deliveries: parseDeliveryRecords(deliveriesSheet),
  };
}
