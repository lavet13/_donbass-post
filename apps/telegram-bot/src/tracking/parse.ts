import type { Row } from "exceljs";

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
