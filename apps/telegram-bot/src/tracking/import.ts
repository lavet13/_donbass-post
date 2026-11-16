import { prisma } from "@/prisma";
import type { Prisma, PromoSource } from "@/lib/prisma/client";
import { promoSource } from "./parse";
import { trackingPeriod, type Period, type ReadyWorkbook } from "./period";

export type ImportSummary = {
  period: Period | null; // null: none of the rows has a date
  deleted: number;
  created: number;
};

/** One file's period replaced, inside a transaction that's already open. */
async function replaceIn(
  tx: Prisma.TransactionClient,
  workbook: ReadyWorkbook,
): Promise<ImportSummary> {
  // An empty file would delete the undated rows and insert nothing
  if (workbook.rows.length === 0)
    throw new Error("В файле нет ни одной строки для загрузки");

  const period = trackingPeriod(workbook);
  switch (workbook.kind) {
    case "rostov": {
      // arrivalDate is required, so rows.length > 0 means a period exists.
      // Checked anyway: `where: { arrivalDate: undefined }` would match
      // EVERY row (Prisma ignores undefined filters) and empty the table.
      const { count: deleted } = await tx.rostovShipment.deleteMany({
        where: rostovWhere(period),
      });
      const { count: created } = await tx.rostovShipment.createMany({
        data: workbook.rows,
      });
      return { period, deleted, created };
    }

    case "lnr": {
      const { count: deleted } = await tx.lnrShipment.deleteMany({
        where: lnrWhere(period),
      });
      const { count: created } = await tx.lnrShipment.createMany({
        data: workbook.rows,
      });
      return { period, deleted, created };
    }

    case "ali":
    case "im": {
      const { count: deleted } = await tx.promoOrder.deleteMany({
        where: promoWhere(promoSource(workbook.kind), period),
      });
      const { count: created } = await tx.promoOrder.createMany({
        data: workbook.rows,
      });
      return { period, deleted, created };
    }
  }
}

/**
 * Replaces the period of every file in its table, all in ONE transaction:
 * either every file is imported, or none is and the old data stays. Each file
 * comes back with its summary attached, so the caller can name it.
 */
export async function replaceTrackingFiles<
  F extends { workbook: ReadyWorkbook },
>(files: F[]): Promise<(F & ImportSummary)[]> {
  return prisma.$transaction(
    async (tx) => {
      const results: (F & ImportSummary)[] = [];
      // one after another: a transaction is one connection, and order matters
      for (const file of files)
        results.push({ ...file, ...(await replaceIn(tx, file.workbook)) });
      return results;
    },
    // all four real files take ~4 s in dev; room for a busy server
    { timeout: 60_000 },
  );
}

// The rows an upload replaces, per table. Shared by countReplacedRows and
// replaceTrackingRows, so the number shown before the import is the number
// the import deletes.

function rostovWhere(period: Period | null): Prisma.RostovShipmentWhereInput {
  // arrivalDate is required, so a Rostov file with rows always has a period.
  // Checked anyway: `{ arrivalDate: undefined }` would match EVERY row
  // (Prisma ignores undefined filters) and empty the table.
  if (!period) throw new Error("Rostov rows without arrival dates");
  return { arrivalDate: { gte: period.from, lte: period.to } };
}

function lnrWhere(period: Period | null): Prisma.LnrShipmentWhereInput {
  return {
    OR: [
      { handoverDate: null },
      ...(period
        ? [{ handoverDate: { gte: period.from, lte: period.to } }]
        : []),
    ],
  };
}

function promoWhere(
  source: PromoSource,
  period: Period | null,
): Prisma.PromoOrderWhereInput {
  return {
    source,
    OR: [
      { paymentDate: null },
      ...(period
        ? [{ paymentDate: { gte: period.from, lte: period.to } }]
        : []),
    ],
  };
}

/** How many rows importing this file would delete: shown before «Загрузить». */
export async function countReplacedRows(
  workbook: ReadyWorkbook,
): Promise<number> {
  const period = trackingPeriod(workbook);
  switch (workbook.kind) {
    case "rostov":
      return prisma.rostovShipment.count({ where: rostovWhere(period) });
    case "lnr":
      return prisma.lnrShipment.count({ where: lnrWhere(period) });
    case "ali":
    case "im":
      return prisma.promoOrder.count({
        where: promoWhere(promoSource(workbook.kind), period),
      });
  }
}
