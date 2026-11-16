import type { TrackingWorkbook } from "./read";

/** A file readTrackingWorkbook accepted. */
export type ReadyWorkbook = Extract<TrackingWorkbook, { ok: true }>;

/** The days a file covers: from its earliest date to its latest, inclusive. */
export type Period = { from: Date; to: Date };

/**
 * The period an upload replaces: earliest to latest date of the column that
 * decides it (Rostov: arrival, LNR: handover, promo: payment). Dates are
 * already plausible (the parsers drop typos), so one bad cell can't stretch
 * it to 1900. Pure, so the bot can show it before importing.
 */
export function trackingPeriod(workbook: ReadyWorkbook): Period | null {
  switch (workbook.kind) {
    case "rostov":
      return periodOf(workbook.rows.map((row) => row.arrivalDate));
    case "lnr":
      return periodOf(workbook.rows.map((row) => row.handoverDate));
    case "ali":
    case "im":
      return periodOf(workbook.rows.map((row) => row.paymentDate));
  }
}

// Prisma's input types allow a date as Date or ISO string; ours are always Dates
function periodOf(dates: (Date | string | null | undefined)[]): Period | null {
  const times = dates
    .filter((date) => date != null)
    .map((date) => new Date(date).getTime());
  if (times.length === 0) return null;
  return {
    from: new Date(Math.min(...times)),
    to: new Date(Math.max(...times)),
  };
}
