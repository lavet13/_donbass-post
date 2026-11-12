/* Uploaded file -> workbook -> parse* -> one database transaction */
import type { Prisma } from "@/lib/prisma/client";
import ExcelJS from "exceljs";
import {
  parseDeliveryRecords,
  parseShipments,
  parseWarehouseMovements,
} from "@/cargo-tracking/parse";
import { prisma } from "@/prisma";

// PERF: ExcelJS's readFile builds the WHOLE workbook in memory before we see a
// single row: measured ~1.1 s and ~216 MB heap for one «Отслеживание» file
// (3 sheets × 50,000 pre-formatted rows, ~1,200 of them with data). Fine for a
// few uploads a day. If memory becomes a problem on the VPS, switch to the
// streaming reader (ExcelJS.stream.xlsx.WorkbookReader): rows arrive one at a
// time and memory stays low.

/** One parsed «Отслеживание» file: rows ready for createMany, per table. */
export type CargoWorkbook = {
  shipments: Prisma.CargoShipmentCreateManyInput[];
  movements: Prisma.CargoWarehouseMovementCreateManyInput[];
  deliveries: Prisma.CargoDeliveryRecordCreateManyInput[];
};

/**
 * Loads one uploaded «Отслеживание» workbook and parses its three sheets.
 * Throws if a sheet is missing (a wrong file was sent): the bot shows that
 * message to the manager, and the file is never added to the upload.
 */
export async function readCargoWorkbook(
  buffer: Buffer,
): Promise<CargoWorkbook> {
  const wb = new ExcelJS.Workbook();

  try {
    await wb.xlsx.load(buffer);
  } catch (err) {
    // ExcelJS's errors are about zip internals; keep them for the logs via `cause`
    throw new Error(
      "Не удалось открыть файл: это не Excel-файл (.xlsx) или он повреждён",
      {
        cause: err,
      },
    );
  }

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

/**
 * Replaces ALL cargo tracking data with the rows from these workbooks (several
 * files = several months, merged). One transaction: if anything fails, the
 * deletes roll back too and the previous data stays. Returns rows inserted per table.
 */
export async function replaceCargoData(workbooks: CargoWorkbook[]) {
  const shipments = workbooks.flatMap((w) => w.shipments);
  const movements = workbooks.flatMap((w) => w.movements);
  const deliveries = workbooks.flatMap((w) => w.deliveries);

  // Guard on the MERGED rows, so [] is caught too. Throw, don't return: the
  // deleteMany() calls below would otherwise wipe every parcel and add nothing back.
  if (shipments.length === 0) {
    throw new Error("В загружаемых файлах нет ни одной строки с ТТН");
  }

  return prisma.$transaction(async (tx) => {
    await tx.cargoShipment.deleteMany(); // no `where` = every row
    await tx.cargoWarehouseMovement.deleteMany();
    await tx.cargoDeliveryRecord.deleteMany();

    const s = await tx.cargoShipment.createMany({ data: shipments });
    const m = await tx.cargoWarehouseMovement.createMany({ data: movements });
    const d = await tx.cargoDeliveryRecord.createMany({ data: deliveries });

    return {
      shipments: s.count,
      movements: m.count,
      deliveries: d.count,
    };
  });
}
