import { prisma } from "@/prisma";
import { trackingPeriod, type Period, type ReadyWorkbook } from "./period";

export type ImportSummary = {
  period: Period | null; // null: none of the rows has a date
  deleted: number;
  created: number;
};
/**
 * Replaces the rows of the file's period in its table, in one transaction:
 * deletes the rows dated inside the period (plus, for LNR and promo, the
 * rows without a date, which belong to no period), then inserts the file's
 * rows. Older rows stay as history. Promo replaces only its own source, so
 * an ALI upload never touches ИМ rows.
 */
export async function replaceTrackingRows(
  workbook: ReadyWorkbook,
): Promise<ImportSummary> {
  // An empty file would delete the undated rows and insert nothing
  if (workbook.rows.length === 0)
    throw new Error("В файле нет ни одной строки для загрузки");

  const period = trackingPeriod(workbook);
  const inPeriod = period ? { gte: period.from, lte: period.to } : null;

  return prisma.$transaction(
    async (tx) => {
      switch (workbook.kind) {
        case "rostov": {
          // arrivalDate is required, so rows.length > 0 means a period exists.
          // Checked anyway: `where: { arrivalDate: undefined }` would match
          // EVERY row (Prisma ignores undefined filters) and empty the table.
          if (!inPeriod) throw new Error("Rostov rows without arrival dates");
          const { count: deleted } = await tx.rostovShipment.deleteMany({
            where: { arrivalDate: inPeriod },
          });
          const { count: created } = await tx.rostovShipment.createMany({
            data: workbook.rows,
          });
          return { period, deleted, created };
        }

        case "lnr": {
          const { count: deleted } = await tx.lnrShipment.deleteMany({
            where: {
              OR: [
                { handoverDate: null },
                ...(inPeriod ? [{ handoverDate: inPeriod }] : []),
              ],
            },
          });
          const { count: created } = await tx.lnrShipment.createMany({
            data: workbook.rows,
          });
          return { period, deleted, created };
        }

        case "ali":
        case "im": {
          const source = workbook.kind === "ali" ? "ALI" : "IM";
          const { count: deleted } = await tx.promoOrder.deleteMany({
            where: {
              source,
              OR: [
                { paymentDate: null },
                ...(inPeriod ? [{ paymentDate: inPeriod }] : []),
              ],
            },
          });
          const { count: created } = await tx.promoOrder.createMany({
            data: workbook.rows,
          });
          return { period, deleted, created };
        }
      }
    },
    // ~21,000 Rostov rows: well past the 5 s default when the server is busy
    { timeout: 30_000 },
  );
}
