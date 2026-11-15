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
    // Outside Excel's date range (1 … 2958465 = 31.12.9999) it's not a date:
    // keep what was typed rather than inventing the year 57233
    if (value < 1 || value > 2_958_465) return cellText(value);

    // Excel counts days from 1899-12-30 (not 1900-01-01: that offset absorbs
    // Excel's fake leap day 29.02.1900). 86_400_000 = ms per day.
    const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(value) * 86_400_000);
    // read it back with getUTCDate/getUTCMonth/getUTCFullYear, never getDate etc.:
    // the local-time getters shift by the server's timezone and can change the day

    return `${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${d.getUTCFullYear()}`;
  }

  const text = cellText(value);

  if (text === null || DATE_PLACEHOLDERS.has(text)) return null;

  const match = text.match(/^(\d{1,2})[.,](\d{1,2})[.,](\d{4})$/);
  if (!match) return text; // not a date → a note ("испорчено", "08.10.2026 возврат…"): keep it

  const [day, month, year] = match.slice(1);
  return `${day?.padStart(2, "0")}.${month?.padStart(2, "0")}.${year}`;
}
