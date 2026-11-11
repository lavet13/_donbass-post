import { prisma } from "@/prisma";

/* Job: the search */

/**
 * Cargo search behind GET /api/cargo-tracking/search/:query. Replaces
 * workplace-post.ru's endpoint, so the body mirrors its format field for field;
 * search-gruz.php reads it unchanged. Returns a plain body; the route wraps it.
 *
 * Lookup: exact ТТН first, then a track number CONTAINING the query (one track
 * cell can hold several tracks). "Not found" is still a normal body with
 * success:false and message "Нет данных о грузе", sent as a 200: the promo form
 * checks that message and would break on a non-2xx.
 */
export async function searchCargo(rawQuery: string) {
  const query = rawQuery.trim();

  if (query === "") {
    return {
      success: false,
      data: { message: "Введите номер!" },
    };
  }

  // Track search needs at least 2 chars: a single "1" appears in hundreds of
  // tracks and would return a random stranger's parcel. Exact ТТН is unaffected.
  const MIN_TRACK_QUERY_LENGTH = 2;

  const shipment =
    (await prisma.cargoShipment.findFirst({
      where: { waybillNumber: query },
    })) ??
    (query.length >= MIN_TRACK_QUERY_LENGTH
      ? await prisma.cargoShipment.findFirst({
          where: { trackNumber: { contains: query, mode: "insensitive" } },
          orderBy: { id: "asc" },
        })
      : null);

  // Not found: the exact shape workplace-post.ru returns (waybillNumber echoes the query)
  if (!shipment) {
    return {
      success: false,
      data: {
        waybillNumber: query,
        receptionDate: "",
        departureCity: "",
        destinationCity: "",
        departureDate: "",
        message: "Нет данных о грузе",
      },
    };
  }

  // Exact ТТН only: contains would pull other parcels' rows (2031420 ⊂ 20314206)
  const movements = await prisma.cargoWarehouseMovement.findMany({
    where: {
      waybillNumber: shipment.waybillNumber,
    },
  });

  const deliveryRecords = await prisma.cargoDeliveryRecord.findMany({
    where: {
      waybillNumber: shipment.waybillNumber,
    },
  });

  // Newest stop first (the frontend no longer reverses). A stop with no
  // departure date is where the parcel is now, so it goes on top.
  // Sorted in TS, not SQL: the dates are DD.MM.YYYY text, which sorts by day
  // ("01.08" < "07.07"); ruDateKey reorders them to YYYYMMDD first.
  // no departure = still at that warehouse = the newest stop
  movements.sort(newestFirst((m) => m.departureDate, "first"));

  // no date = unknown, so it should never win the tie-break
  deliveryRecords.sort(newestFirst((d) => d.arrivalDate, "last"));

  // Rows are newest-arrival first, so: the latest row that was handed over,
  // else the latest arrival. Duplicates come from merged months, e.g. October
  // has the "Дата" placeholder and November the real outcome.
  const delivery =
    deliveryRecords.find((r) => r.deliveryDate) ?? deliveryRecords[0] ?? null;

  // Build the body once; the message only decides the status line
  return {
    success: true,
    data: {
      waybillNumber: shipment.waybillNumber,
      // JSON.stringify DROPS undefined but KEEPS null, so `?? undefined`
      // turns an empty column into an absent key, like the live API
      trackNumber: shipment.trackNumber ?? undefined,
      receptionDate: shipment.receptionDate ?? undefined,
      departureCity: shipment.departureCity ?? undefined,
      destinationCity: shipment.destinationCity ?? undefined,
      departureDate: shipment.departureDate ?? undefined,
      message: cargoStatusMessage(movements.length > 0, delivery),
      // ternary + spread: adds the key only when there's something to put in it
      ...(movements.length > 0
        ? {
            warehouseMovements: movements.map((m) => ({
              arrivalDate: m.arrivalDate ?? undefined,
              departureDate: m.departureDate ?? undefined,
              warehousePoint: m.warehousePoint ?? undefined,
            })),
          }
        : {}),
      ...(delivery
        ? {
            deliveryRecord: {
              arrivalDate: delivery.arrivalDate ?? undefined,
              deliveryDate: delivery.deliveryDate ?? undefined,
            },
          }
        : {}),
    },
  };
}

/**
 * Builds a sort comparator: newest DD.MM.YYYY date first. `missing` says where
 * rows without a parseable date go, because the two callers need opposite
 * answers: for movements, "no departure" means the current stop (first); for
 * delivery records, "no arrival" is unknown data (last).
 */
function newestFirst<T>(
  getDate: (row: T) => string | null, // which field to sort by, e.g. (m) => m.departureDate
  missing: "first" | "last",
) {
  // the returned arrow is what .sort() calls; it remembers getDate and
  // missing through the closure
  return (a: T, b: T): number => {
    // -1 = a first
    // 1 = b first
    // 0 = no switch
    const ka = ruDateKey(getDate(a));
    const kb = ruDateKey(getDate(b));
    if (ka === kb) return 0;
    if (ka === null) return missing === "first" ? -1 : 1;
    if (kb === null) return missing === "first" ? 1 : -1;

    // Both rows have a real date here (equal / missing were handled above).
    // We want NEWEST first, so the LATER date wins:
    //   ka > kb → a is later   → -1 → a goes first
    //   ka < kb → a is earlier →  1 → b goes first
    // ka/kb are YYYYMMDD strings, so ">" compares them as dates (see ruDateKey).
    // For oldest-first you'd flip it to `ka < kb ? -1 : 1`.
    return ka > kb ? -1 : 1; // the flip from before: LATER date → negative → goes first
  };
}

/**
 * Turns "07.07.2025" into "20250707": year-month-day with fixed widths, so plain
 * string comparison gives date order. Anything else ("испорчена", null) → null,
 * the caller decides where those go.
 */
export function ruDateKey(raw: string | null): string | null {
  if (!raw) return null;
  const [day, month, year] = raw.split(".");
  // ?.length: a missing part is undefined, so the check fails, not throws
  if (day?.length !== 2 || month?.length !== 2 || year?.length !== 4)
    return null;
  return year + month + day;
}

/**
 * Picks the status from the MOST ADVANCED stage the parcel has reached.
 * Checked latest-first because stages can be skipped: 20 of 177 delivered
 * parcels in the October file had no warehouse (СВХ) stop at all.
 * Relies on the import storing placeholder dates ("Дата") as null.
 */
export function cargoStatusMessage(
  hasMovements: boolean,
  delivery: { deliveryDate: string | null } | null,
): string {
  if (delivery?.deliveryDate) return "Груз выдан получателю";
  if (delivery) return "Груз ожидает вручения в городе получения";
  if (hasMovements)
    return "Груз еще в пути, следует с транзитного пункта в конечный пункт получения";
  return "Груз еще в пути и не достиг конечного пункта назначения";
}
