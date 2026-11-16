import { prisma } from "@/prisma";
import { ruDay } from "@/utils/cell";
import { promoStatusText, rostovStatus } from "./status";

/**
 * GET /api/tracking/:ttn. A ТТН in Rostov (newest arrival only: numbers are
 * reused across years) and in LNR (every declaration; not handed over yet
 * first). Both lookups are exact matches on an indexed column.
 */
export async function searchTracking(waybillNumber: string) {
  const [rostov, lnr] = await Promise.all([
    prisma.rostovShipment.findFirst({
      where: { waybillNumber },
      orderBy: [{ arrivalDate: "desc" }, { id: "asc" }],
    }),
    prisma.lnrShipment.findMany({
      where: { waybillNumber },
      orderBy: [
        { handoverDate: { sort: "desc", nulls: "first" } },
        { id: "asc" },
      ],
    }),
  ]);

  return {
    rostov: rostov && {
      waybillNumber: rostov.waybillNumber,
      arrivalDate: ruDay(rostov.arrivalDate),
      dispatchDate: rostov.dispatchDate && ruDay(rostov.dispatchDate),
      carrier: rostov.carrier,
      carrierTrackNumber: rostov.carrierTrackNumber,
      status: rostovStatus(rostov.carrier, rostov.dispatchDate),
    },
    lnr: lnr.map((row) => ({
      waybillNumber: row.waybillNumber,
      handoverDate: row.handoverDate && ruDay(row.handoverDate),
      deliveryAddress: row.deliveryAddress,
      declarationNumber: row.declarationNumber,
    })),
  };
}

/**
 * GET /api/im-tracking/:promo. Every order whose cell lists this code (one
 * code can appear twice: a real order and a cancelled row), newest payment
 * first, undated rows last: in the promo files those are mostly extras.
 */
export async function searchPromo(code: string) {
  const orders = await prisma.promoOrder.findMany({
    where: { promoCodes: { has: code } },
    orderBy: [{ paymentDate: { sort: "desc", nulls: "last" } }, { id: "asc" }],
  });

  return orders.map((order) => ({
    promoCodes: order.promoCodeRaw,
    amountPaid: order.amountPaid === null ? null : order.amountPaid.toNumber(),
    paymentDate: order.paymentDate && ruDay(order.paymentDate),
    trackNumber: order.trackNumber,
    status: order.status,
    statusText: promoStatusText(order.status),
  }));
}
