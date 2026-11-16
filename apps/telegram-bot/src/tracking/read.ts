import { Readable } from "node:stream";
import ExcelJS from "exceljs";
import type { Row } from "exceljs";
import type { Prisma } from "@/lib/prisma/client";
import {
  decideFileKind,
  detectKind,
  findColumns,
  parseLnrRow,
  parsePromoRow,
  parseRostovRow,
  SPECS,
  type Kind,
  type RowResult,
  type SheetSummary,
} from "./parse";

/** One reported row: where it is, and what's wrong with it. */
export type RowIssue = { sheet: string; row: number; text: string };

export type TrackingReport = {
  skippedRows: RowIssue[]; // not imported
  problems: RowIssue[]; // imported, but something was left empty
  skippedSheets: SheetSummary[]; // data under headers we don't know
};

/** A whole uploaded file, read: its kind and rows, or why it was refused. */
export type TrackingWorkbook =
  | { ok: true; kind: "rostov"; rows: Prisma.RostovShipmentCreateManyInput[]; report: TrackingReport }
  | { ok: true; kind: "lnr"; rows: Prisma.LnrShipmentCreateManyInput[]; report: TrackingReport }
  | { ok: true; kind: "ali" | "im"; rows: Prisma.PromoOrderCreateManyInput[]; report: TrackingReport }
  | { ok: false; error: string };

type Collected = {
  rostov: Prisma.RostovShipmentCreateManyInput[];
  lnr: Prisma.LnrShipmentCreateManyInput[];
  promo: Prisma.PromoOrderCreateManyInput[];
};

// Every .xlsx is a zip archive, and every zip starts with "PK\x03\x04"
const XLSX_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

/**
 * Reads an uploaded tracking file (Rostov, LNR, ALI or ИМ) with ExcelJS's
 * streaming reader: rows arrive one at a time, so memory stays ~100 MiB
 * above Node's baseline, where loading the whole ИМ workbook needs ~470.
 *
 * Each sheet's first row decides its kind; its rows are parsed as they
 * arrive; the file's kind is decided once every sheet is read
 * (decideFileKind). Rows of the chosen kind are returned ready for
 * createMany, with a report of what was skipped and where.
 *
 * Refused (ok: false): not an xlsx, an unknown or mixed file. Throws when
 * the archive itself is broken (a truncated upload), with the reader's
 * error as `cause`.
 */
export async function readTrackingWorkbook(buffer: Buffer): Promise<TrackingWorkbook> {
  if (!buffer.subarray(0, 4).equals(XLSX_MAGIC))
    return { ok: false, error: "Это не Excel-файл (.xlsx): отправьте таблицу в формате .xlsx" };

  const collected: Collected = { rostov: [], lnr: [], promo: [] };
  const sheets: SheetSummary[] = [];
  const issues: (RowIssue & { kind: Kind; skipped: boolean })[] = [];

  // WorkbookReader takes a path or a stream; Readable.from wraps the buffer
  // in a stream that emits it as one chunk
  const reader = new ExcelJS.stream.xlsx.WorkbookReader(Readable.from([buffer]), {
    worksheets: "emit",
    sharedStrings: "cache",
    styles: "cache", // fills: the promo status colour
    hyperlinks: "ignore",
    entries: "ignore",
  });

  try {
    let index = 0;
    for await (const ws of reader) {
      index++;
      // Set at runtime, but missing from ExcelJS's types for the stream reader
      const name = (ws as typeof ws & { name?: string }).name ?? `Лист ${index}`;

      let kind: Kind | null = null;
      let parse: ((row: Row) => RowResult<unknown> | null) | null = null;
      let dataRows = 0;

      for await (const row of ws) {
        // Only row 1 is a header. A sheet whose first row is empty never
        // emits row 1, so it stays kind null.
        if (row.number === 1) {
          kind = detectKind(row);
          if (kind !== null) parse = sheetParser(kind, row, collected);
          continue;
        }

        // Unknown layout: no key column to judge by, so any filled row
        // counts. Otherwise its data would be dropped without a report.
        if (kind === null || parse === null) {
          if (row.hasValues) dataRows++;
          continue;
        }

        const result = parse(row);
        if (result === null) continue; // not a data row
        dataRows++;

        if (!result.ok)
          issues.push({ kind, skipped: true, sheet: name, row: row.number, text: result.reason });
        else
          for (const text of result.problems)
            issues.push({ kind, skipped: false, sheet: name, row: row.number, text });
      }

      sheets.push({ name, kind, dataRows });
    }
  } catch (cause) {
    throw new Error("Не удалось прочитать файл: он повреждён или это не таблица Excel", { cause });
  }

  const decision = decideFileKind(sheets);
  if (!decision.ok) return decision;

  // Issues from empty sheets of another kind can't exist (no data rows),
  // but filtering keeps the report about the chosen kind only
  const own = issues.filter((issue) => issue.kind === decision.kind);
  const report: TrackingReport = {
    skippedRows: own.filter((i) => i.skipped).map(({ sheet, row, text }) => ({ sheet, row, text })),
    problems: own.filter((i) => !i.skipped).map(({ sheet, row, text }) => ({ sheet, row, text })),
    skippedSheets: decision.skipped,
  };

  switch (decision.kind) {
    case "rostov":
      return { ok: true, kind: "rostov", rows: collected.rostov, report };
    case "lnr":
      return { ok: true, kind: "lnr", rows: collected.lnr, report };
    case "ali":
    case "im":
      return { ok: true, kind: decision.kind, rows: collected.promo, report };
  }
}

/** The row parser for one sheet: parses a row and keeps its data if it's ok. */
function sheetParser(kind: Kind, header: Row, collected: Collected) {
  switch (kind) {
    case "rostov": {
      const columns = columnsFor(header, SPECS.rostov);
      return collect(collected.rostov, (row) => parseRostovRow(row, columns));
    }
    case "lnr": {
      const columns = columnsFor(header, SPECS.lnr);
      return collect(collected.lnr, (row) => parseLnrRow(row, columns));
    }
    case "ali":
    case "im": {
      const columns = columnsFor(header, SPECS[kind]);
      const source = kind === "ali" ? "ALI" : "IM";
      return collect(collected.promo, (row) => parsePromoRow(row, columns, source));
    }
  }
}

/** Wraps a row parser so every successful row also lands in `target`. */
function collect<T>(target: T[], parse: (row: Row) => RowResult<T> | null) {
  return (row: Row): RowResult<T> | null => {
    const result = parse(row);
    if (result?.ok) target.push(result.data);
    return result;
  };
}

/** findColumns that can't fail: detectKind already matched this spec. */
function columnsFor<K extends string>(header: Row, spec: Record<K, string>): Record<K, number> {
  const result = findColumns(header, spec);
  if (!result.ok)
    throw new Error(`detectKind matched, but findColumns failed: ${JSON.stringify(result)}`);
  return result.columns;
}
