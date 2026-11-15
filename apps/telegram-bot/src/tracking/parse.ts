import { cellText } from "@/utils/cell";
import type { Row, Cell } from "exceljs";
import type { PromoOrderStatus } from "@/lib/prisma/client";

export type ColumnsResult<K extends string> =
  | {
      ok: true;
      columns: Record<K, number>;
    }
  | {
      ok: false;
      missing: string[];
      ambiguous: { header: string; columns: number[] }[];
    };

/**
 * Finds the column of each field by its header text, so a parser doesn't
 * depend on column positions (ALI and ИМ put «идентификатор» in different
 * columns, and so does ALI's own «V» sheet).
 *
 * Every header must match exactly one column. None → `missing`; several →
 * `ambiguous` (the promo sheets have one «дата» and three «ДАТА»). Reported
 * rather than guessed: a wrong guess would read the wrong data silently.
 *
 * Returns a result instead of throwing: during file detection a miss is the
 * normal answer "not this kind of file", not an error.
 */
export function findColumns<K extends string>(
  headerRow: Row, // the row that holds the headers (row 1 in all four files)
  spec: Record<K, string>, // field → header text, e.g. { paymentDate: "дата" }
): ColumnsResult<K> {
  const byHeader = new Map<string, number[]>(); // answers “which columns have this text?”

  // the buckets
  const columns: Partial<Record<K, number>> = {};
  const missing: string[] = [];
  const ambiguous: { header: string; columns: number[] }[] = [];

  headerRow.eachCell((cell, colNumber) => {
    // 1. turn the cell into comparable text
    const header = normalizeHeader(cell.text);
    // 2. skip it if that text is empty
    if (header === "") return;
    // 3. add colNumber to that text's list in the map
    const cols = byHeader.get(header);
    if (cols) cols.push(colNumber);
    else byHeader.set(header, [colNumber]);
  });

  for (const [field, header] of Object.entries(spec) as [K, string][]) {
    // 1. ask the map: which columns have this header?
    const found = byHeader.get(normalizeHeader(header)) ?? [];

    // 2. none → missing
    if (found.length === 0) {
      missing.push(header);
    }
    // 3. more than one → ambiguous
    else if (found.length > 1) {
      ambiguous.push({ header, columns: found });
    }
    // 4. exactly one → columns[field] = that column
    else {
      columns[field] = found[0];
    }
  }

  if (ambiguous.length !== 0 || missing.length !== 0) {
    return {
      ok: false,
      missing,
      ambiguous,
    };
  }

  // every field reached the exactly-one branch
  return {
    ok: true,
    columns: columns as Record<K, number>,
  };
}

/**
 * Makes two header texts comparable: collapses every run of whitespace
 * (spaces, line breaks from Alt+Enter, non-breaking spaces) into one space
 * and trims the ends, so «Дата передачи     (в "ПЛ")» matches
 * «Дата передачи (в "ПЛ")».
 * Case is kept on purpose: «дата» and «ДАТА» are different columns in the
 * promo files.
 */
function normalizeHeader(text: string) {
  return text.trim().replace(/\s+/g, " ");
}

const PROMO = {
  promoCodes: "ПРОМОКОД",
  amountPaid: "СУММА В ТТН",
  paymentDate: "дата", // lowercase on purpose: «ДАТА» is a different column
  trackNumber: "идентификатор",
} as const;

/** Header text of every column we read, per file kind. */
export const SPECS = {
  rostov: {
    arrivalDate: "Дата прибытия",
    waybillNumber: "№ ТТН",
    dispatchDate: "Дата выдачи, пересылки",
    carrier: "Отпралено Др дост", // sic: the typo is in the real header
    carrierTrackNumber: "Трек, индификатор, код чека", // sic
  },
  lnr: {
    waybillNumber: "№ ТТН",
    handoverDate: 'Дата передачи (в "ПЛ")',
    deliveryAddress: "Населенный пункт выдачи груза",
    declarationNumber: '№ декларации "ПЛ"',
  },
  // `marker` is never read as data: it only makes ALI and ИМ sheets tell apart
  ali: { ...PROMO, marker: "ССЫЛКА ЗАКАЗА" },
  im: { ...PROMO, marker: "ОТКУДА ЗАКАЗ" },
} as const;

export type Kind = keyof typeof SPECS; // "rostov" | "lnr" | "ali" | "im"
const KINDS = Object.keys(SPECS) as Kind[];

/**
 * Tells which kind of file a sheet belongs to, from its header row alone:
 * a kind matches when every header of its spec is found exactly once.
 * Returns null for a sheet that matches none (an empty «Лист1», notes,
 * a layout we don't know).
 *
 * The ALI/ИМ `marker` headers keep at most one kind matching. Two matches
 * would be a bug in SPECS, not in the file, so that throws.
 */
export function detectKind(headerRow: Row): Kind | null {
  // <string>: SPECS[kind] is a union of four specs, and TS can't pick one K
  // for all of them. Detection only needs `.ok`, not the field names.
  const matches = KINDS.filter(
    (kind) => findColumns<string>(headerRow, SPECS[kind]).ok,
  );

  // Two specs matching one header is a bug in SPECS, not a bad file
  if (matches.length > 1)
    throw new Error(`SPECS bug: one header row matches ${matches.join(", ")}`);

  return matches[0] ?? null;
}

export type SheetSummary = {
  name: string;
  kind: Kind | null;
  dataRows: number;
};

export type FileKindResult =
  | { ok: true; kind: Kind; skipped: SheetSummary[] }
  | { ok: false; error: string };

const KIND_LABELS = {
  rostov: "Ростов",
  lnr: "ЛНР",
  ali: "ALI",
  im: "ИМ",
} satisfies Record<Kind, string>; // a new kind without a label is a compile error

/**
 * Decides the kind of a whole file from its sheets, once all of them are
 * read, so the order the streaming reader emits them in doesn't matter.
 *
 * Only sheets with data rows vote: an empty sheet with another layout (ALI's
 * «V» has the ИМ headers) can't change the answer. All voters must agree; a
 * mix is refused, because one upload replaces one dataset's date range.
 * Sheets with data but an unknown layout come back in `skipped`, so the bot
 * names them instead of dropping their rows silently.
 */
export function decideFileKind(sheets: SheetSummary[]): FileKindResult {
  // Empty sheets don't vote: they have nothing to import or lose (ALI's «V»)
  const voters = sheets.filter((s) => s.dataRows > 0);

  // kind -> names of the sheets of that kind
  const byKind = new Map<Kind, string[]>();
  for (const s of voters) {
    if (s.kind === null) continue; // unknown layout: reported in `skipped`, no vote
    const names = byKind.get(s.kind);
    if (names) names.push(s.name);
    else byKind.set(s.kind, [s.name]);
  }

  // Decided only after every sheet is in, so the streaming order doesn't matter
  const [only, ...others] = byKind.keys();

  if (only === undefined) {
    return {
      ok: false,
      error:
        "Не удалось определить тип файла: ни один лист не похож на Ростов, ЛНР, ALI или ИМ",
    };
  }

  if (others.length > 0) {
    const list = [...byKind]
      .map(([kind, names]) => `${KIND_LABELS[kind]}: «${names.join("», «")}»`)
      .join("; ");
    return {
      ok: false,
      error: `В файле листы разных типов (${list}). Отправьте их отдельными файлами`,
    };
  }

  return {
    ok: true,
    kind: only,
    skipped: voters.filter((s) => s.kind === null), // data, but a layout we don't know
  };
}

/**
 * ТТН from a «№ ТТН» cell: the first number of exactly 8 digits, so extras
 * like «21302284 А», «52600001/3» or «21900459 (23500013)» still give the
 * waybill. The lookarounds keep it from cutting 8 digits out of a longer
 * number. null when there's none: the caller skips and reports the row.
 */
export function cellWaybill(value: unknown): string | null {
  return cellText(value)?.match(/(?<!\d)\d{8}(?!\d)/)?.[0] ?? null;
}

/**
 * Promo codes in a ПРОМОКОД cell: every run of 4+ digits, so a cell with
 * several codes («129811  129812», «4412/4414») gives each of them, and
 * shorter numbers around them («A-177(3386,…)») aren't taken as codes.
 * Duplicates are dropped. An empty cell or «БЕЗ» → [], which the caller
 * reports as a row it couldn't import.
 */
export function promoCodes(value: unknown): string[] {
  const text = cellText(value);
  if (text === null) return [];
  return [...new Set(text.match(/\d{4,}/g) ?? [])];
}

const STATUS_BY_FILL = {
  FFFFC000: "ORDER_PLACED", // orange
  FFFFFF00: "SHIPPED_BY_STORE", // yellow
  FF00B0F0: "PROCESSED_IN_ROSTOV", // blue
  FF92D050: "DELIVERED", // green
  FF00B050: "DELIVERED", // darker green, 46 ИМ archive rows
  FFFF0000: "CANCELLED", // red
} satisfies Record<string, PromoOrderStatus>;

/**
 * Promo order status from the fill colour of its ПРОМОКОД cell, the
 * managers' meanings (see STATUS_BY_FILL). No fill, a theme colour or an
 * unknown shade → null.
 */
export function fillStatus(cell: Cell): PromoOrderStatus | null {
  const argb =
    cell.fill?.type === "pattern" ? cell.fill.fgColor?.argb : undefined;

  if (!argb) return null;

  return Object.hasOwn(STATUS_BY_FILL, argb)
    ? STATUS_BY_FILL[argb as keyof typeof STATUS_BY_FILL]
    : null;
}
