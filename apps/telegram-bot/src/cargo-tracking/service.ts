import { prisma } from "@/prisma";

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

  const shipment =
    (await prisma.cargoShipment.findFirst({
      where: { waybillNumber: query },
    })) ??
    (await prisma.cargoShipment.findFirst({
      where: { trackNumber: { contains: query } },
    }));

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

  // prefer a row that has a delivery date; [0] may be undefined (noUncheckedIndexedAccess)
  const delivery =
    deliveryRecords.find((r) => r.deliveryDate) ?? deliveryRecords[0] ?? null;

  // Oldest stop first; a stop with no departure date is the current one, so it goes last
  // Example:
  // "20250707" vs "20250801"
  // 2025 = 2025, then 0 = 0, then 7 < 8 -> July comes first ✓ (decided by the month)
  //
  // "07.07.2025" vs "01.08.2025"   <- the raw DD.MM.YYYY text
  // 0 = 0, then 7 > 1              -> August comes first ✗ (decided by the DAY)
  // The frontend then calls .reverse(), so the user sees the current stop at the top.
  movements.sort((a, b) => {
    const ka = ruDateKey(a.departureDate);
    const kb = ruDateKey(b.departureDate);
    if (ka === kb) return 0; // same date, or both missing: keep order
    if (ka === null) return 1; // a has no date → a goes AFTER b ("still at the warehouse" = latest)
    if (kb === null) return -1; // b has no date → a goes first

    // negative puts a first, positive puts b first, 0 leaves them as they are
    return ka < kb ? -1 : 1; // both dates: earlier first
  });

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
 * Turns "07.07.2025" into "20250707": year-month-day with fixed widths, so plain
 * string comparison gives date order. Anything else ("испорчена", null) → null,
 * which the movement sort puts last.
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
