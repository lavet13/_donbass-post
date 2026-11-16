import { Readable } from "node:stream";
import ExcelJS from "exceljs";
import type { Row } from "exceljs";
import { cellText, plainValue } from "@/utils/cell";
import type { Prisma } from "@/lib/prisma/client";
import {
  decideFileKind,
  detectKind,
  findColumns,
  parseLnrRow,
  parsePromoRow,
  parseRostovRow,
  promoSource,
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
  | {
      ok: true;
      kind: "rostov";
      rows: Prisma.RostovShipmentCreateManyInput[];
      report: TrackingReport;
    }
  | {
      ok: true;
      kind: "lnr";
      rows: Prisma.LnrShipmentCreateManyInput[];
      report: TrackingReport;
    }
  | {
      ok: true;
      kind: "ali" | "im";
      rows: Prisma.PromoOrderCreateManyInput[];
      report: TrackingReport;
    }
  | {
      ok: false;
      reason: "not-xlsx" | "unknown" | "mixed";
      error: string;
      sheetNames: string[];
    };

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
export async function readTrackingWorkbook(
  buffer: Buffer,
): Promise<TrackingWorkbook> {
  if (!buffer.subarray(0, 4).equals(XLSX_MAGIC))
    return {
      ok: false,
      reason: "not-xlsx",
      sheetNames: [],
      error: "Это не Excel-файл (.xlsx): отправьте таблицу в формате .xlsx",
    };

  const collected: Collected = { rostov: [], lnr: [], promo: [] };
  const sheets: SheetSummary[] = [];
  const issues: (RowIssue & { kind: Kind; skipped: boolean })[] = [];

  // WorkbookReader takes a path or a stream; Readable.from wraps the buffer
  // in a stream that emits it as one chunk
  const reader = new ExcelJS.stream.xlsx.WorkbookReader(
    Readable.from([buffer]),
    {
      worksheets: "emit",
      sharedStrings: "cache",
      styles: "cache", // fills: the promo status colour
      hyperlinks: "ignore",
      entries: "ignore",
    },
  );

  try {
    let index = 0;
    for await (const ws of reader) {
      index++;
      // Set at runtime, but missing from ExcelJS's types for the stream reader
      const name =
        (ws as typeof ws & { name?: string }).name ?? `Лист ${index}`;

      let kind: Kind | null = null;
      let parse: ((row: Row) => RowResult<unknown> | null) | null = null;
      let dataRows = 0;
      let block: MergedBlock | null = null; // how this sheet's merged rows look
      let previous: Row | null = null; // the last data row, for a block to continue

      for await (const row of ws) {
        // Only row 1 is a header. A sheet whose first row is empty never
        // emits row 1, so it stays kind null.
        if (row.number === 1) {
          kind = detectKind(row);
          if (kind !== null) {
            parse = sheetParser(kind, row, collected);
            block = mergedBlock(kind, row);
          }
          continue;
        }

        // Unknown layout: no key column to judge by, so any filled row
        // counts. Otherwise its data would be dropped without a report.
        if (kind === null || parse === null) {
          if (row.hasValues) dataRows++;
          continue;
        }

        // A merged ТТН reaches only its block's first row: fill the rest in
        if (
          block &&
          previous?.number === row.number - 1 &&
          continuesBlock(row, block)
        )
          for (const column of block.columns)
            if (isBlank(row.getCell(column).value))
              row.getCell(column).value = previous.getCell(column).value;

        const result = parse(row);
        if (result === null) {
          previous = null; // a gap ends any block
          continue;
        }
        previous = row;
        dataRows++;

        if (!result.ok)
          issues.push({
            kind,
            skipped: true,
            sheet: name,
            row: row.number,
            text: result.reason,
          });
        else
          for (const text of result.problems)
            issues.push({
              kind,
              skipped: false,
              sheet: name,
              row: row.number,
              text,
            });
      }

      sheets.push({ name, kind, dataRows });
    }
  } catch (cause) {
    throw new Error(
      "Не удалось прочитать файл: он повреждён или это не таблица Excel",
      { cause },
    );
  }

  const decision = decideFileKind(sheets);
  // sheetNames: lets the caller recognise a cargo file without loading it whole
  if (!decision.ok)
    return { ...decision, sheetNames: sheets.map((s) => s.name) };

  // Issues from empty sheets of another kind can't exist (no data rows),
  // but filtering keeps the report about the chosen kind only
  const own = issues.filter((issue) => issue.kind === decision.kind);
  const report: TrackingReport = {
    skippedRows: own
      .filter((i) => i.skipped)
      .map(({ sheet, row, text }) => ({ sheet, row, text })),
    problems: own
      .filter((i) => !i.skipped)
      .map(({ sheet, row, text }) => ({ sheet, row, text })),
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
      const source = promoSource(kind);
      return collect(collected.promo, (row) =>
        parsePromoRow(row, columns, source),
      );
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
function columnsFor<K extends string>(
  header: Row,
  spec: Record<K, string>,
): Record<K, number> {
  const result = findColumns(header, spec);
  if (!result.ok)
    throw new Error(
      `detectKind matched, but findColumns failed: ${JSON.stringify(result)}`,
    );
  return result.columns;
}

/**
 * The columns of a merged block. The streaming reader ignores merged cells:
 * a merged cell's value reaches only the block's first row, the rows below
 * see it empty. The real files write one ТТН with several declarations (LNR)
 * or tracks (Rostov) that way: ТТН, dates and address merged, `own` filled
 * on every row. Promo files have no merged rows.
 */
type MergedBlock = { key: number; own: number; columns: number[] };

function mergedBlock(kind: Kind, header: Row): MergedBlock | null {
  switch (kind) {
    case "rostov": {
      const c = columnsFor(header, SPECS.rostov);
      return {
        key: c.waybillNumber,
        own: c.carrierTrackNumber,
        columns: Object.values(c),
      };
    }
    case "lnr": {
      const c = columnsFor(header, SPECS.lnr);
      return {
        key: c.waybillNumber,
        own: c.declarationNumber,
        columns: Object.values(c),
      };
    }
    default:
      return null;
  }
}

/** A row with no ТТН but its own declaration/track continues the row above. */
function continuesBlock(row: Row, block: MergedBlock): boolean {
  return (
    isBlank(row.getCell(block.key).value) &&
    !isBlank(row.getCell(block.own).value)
  );
}

/** An empty cell, for filling. cellText alone would call a Date blank. */
function isBlank(value: unknown): boolean {
  const plain = plainValue(value);
  return !(plain instanceof Date) && cellText(plain) === null;
}
