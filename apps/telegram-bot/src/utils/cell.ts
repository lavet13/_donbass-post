/**
 * Cleans a cell from a text column (ТТН, cities, tracks, points) into a
 * trimmed string or null. ТТН and tracks often arrive as numbers, so numbers
 * are converted, not dropped. Anything else (an empty cell, ExcelJS's
 * { error: "#N/A" } for a broken formula) → null.
 */
export function cellText(value: unknown): string | null {
  // Guard clause: It’s not about rejecting numbers and strings. It rejects everything else
  // After the condition: everything below it only ever sees numbers and strings.
  if (typeof value !== "number" && typeof value !== "string") return null;

  // Whole numbers print as plain digits even when huge: String(1e21) is "1e+21",
  // BigInt(1e21).toString() is all digits. BigInt() throws on non-integers
  // (RangeError), hence the isInteger check first.
  const raw =
    typeof value === "number" && Number.isInteger(value)
      ? BigInt(value).toString()
      : String(value);
  const text = raw.trim();
  return text === "" ? null : text;
}

// Words that mean "no date yet" — they become null, not text
const DATE_PLACEHOLDERS = new Set(["Дата", "Дата выдачи"]); // Set.has = exact-match lookup

/**
 * Cleans a cell from a date column into what the customer should see:
 *   - Excel serial number (46303, 46303.49…) → "08.10.2026". The fraction is a
 *     time of day and is dropped: everything is displayed as DD.MM.YYYY.
 *   - date text "8.10.2026" / "07,07,2025" → "08.10.2026" / "07.07.2025"
 *     (1-digit day/month padded, commas → dots).
 *   - empty cell, "Дата" / "Дата выдачи" placeholders, { error } → null:
 *     "no date yet". cargoStatusMessage relies on this to tell "выдан" from
 *     "ожидает".
 *   - any other text ("испорчено", "удалена", "08.10.2026 возврат…") is a note
 *     for the customer, returned as written.
 * Only valid on date columns: the same number in a ТТН column is not a date.
 */
export function cellDate(value: unknown): string | null {
  if (typeof value === "number") {
    const d = serialToDate(value);

    // not a serial: keep what was typed rather than inventing the year 57233
    if (d === null) return cellText(value);

    // getUTC* getters, never getDate etc.: the local-time getters shift by the
    // server's timezone and can change the day
    return `${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${d.getUTCFullYear()}`;
  }

  const text = cellText(value);

  if (text === null || DATE_PLACEHOLDERS.has(text)) return null;

  const match = text.match(/^(\d{1,2})[.,](\d{1,2})[.,](\d{4})$/);
  if (!match) return text; // not a date → a note ("испорчено", "08.10.2026 возврат…"): keep it

  const [day, month, year] = match.slice(1);
  return `${day?.padStart(2, "0")}.${month?.padStart(2, "0")}.${year}`;
}

export type DayCell =
  | { kind: "empty" }
  | { kind: "day"; day: Date } // UTC midnight, ready for a @db.Date column
  | { kind: "invalid"; text: string }; // the text as written, for the bot's report

/**
 * Reads a cell from a date column as a calendar day (UTC midnight), for the
 * tracking tables' @db.Date columns. Three answers, because the caller treats
 * them differently:
 *   - "empty": no date yet (empty cell, "Дата" placeholder, { error }), normal;
 *   - "day": a Date cell (time dropped), an Excel serial, or text like
 *     "8.10.2026", "01,06,18", "20.03.18" (two-digit years mean 20yy: the data
 *     starts in 2018);
 *   - "invalid": anything else ("выдано", "21-25.10.2019", "31.02.2026"),
 *     returned as written so the bot can name it.
 * Only answers "is this a date?": whether the year is plausible is the
 * import's rule, not this function's.
 */
export function cellDay(value: unknown): DayCell {
  if (value instanceof Date) {
    // new Date("garbage") is still a Date, but every getter returns NaN

    if (Number.isNaN(value.getTime()))
      return { kind: "invalid", text: String(value) };

    // Rebuilt from its UTC parts: drops a time of day without moving the day
    return {
      kind: "day",
      day: new Date(
        Date.UTC(
          value.getUTCFullYear(),
          value.getUTCMonth(),
          value.getUTCDate(),
        ),
      ),
    };
  }

  if (typeof value === "number") {
    const day = serialToDate(value);
    return day
      ? { kind: "day", day }
      : { kind: "invalid", text: String(value) };
  }

  const text = cellText(value);
  if (text === null || DATE_PLACEHOLDERS.has(text)) return { kind: "empty" };

  // dd.mm.yy or dd.mm.yyyy, with dots or commas: "8.10.2026", "01,06,18"
  const match = text.match(/^(\d{1,2})[.,](\d{1,2})[.,](\d{2}|\d{4})$/);
  if (!match) return { kind: "invalid", text };

  const [day, month, year] = match.slice(1).map(Number) as [
    number,
    number,
    number,
  ];
  const fullYear = year < 100 ? 2000 + year : year;
  const date = new Date(Date.UTC(fullYear, month - 1, day));

  // Date.UTC doesn't reject 31.02, it rolls over to 03.03. If the day or month
  // changed on the way, the input was impossible.
  if (date.getUTCDate() !== day || date.getUTCMonth() !== month - 1)
    return { kind: "invalid", text };

  return { kind: "day", day: date };
}

/**
 * Excel serial number → UTC midnight of that day, or null when the number is
 * outside Excel's date range (1 … 2958465 = 31.12.9999) and so isn't a date.
 * The caller decides what null means: cellDate keeps the typed text, cellDay
 * reports it as invalid.
 */
function serialToDate(serial: number): Date | null {
  // Outside Excel's date range (1 … 2958465 = 31.12.9999) it's not a date:
  // keep what was typed rather than inventing the year 57233
  if (serial < 1 || serial > 2_958_465) return null;

  // Excel counts days from 1899-12-30 (not 1900-01-01: that offset absorbs
  // Excel's fake leap day 29.02.1900). 86_400_000 = ms per day.
  // read it back with getUTCDate/getUTCMonth/getUTCFullYear, never getDate etc.:
  // the local-time getters shift by the server's timezone and can change the day
  return new Date(Date.UTC(1899, 11, 30) + Math.floor(serial) * 86_400_000);
}
