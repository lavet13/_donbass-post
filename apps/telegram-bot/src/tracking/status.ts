import type { PromoOrderStatus } from "@/lib/prisma/client";

/**
 * What happened to a parcel in Rostov, in the customer's words. «выдан» in
 * the carrier column (2018–2019 sheets) means it was handed out in Rostov;
 * a dispatch date or a carrier means it went on with another delivery service.
 */
export function rostovStatus(
  carrier: string | null,
  dispatchDate: Date | null,
): string {
  if (carrier !== null && /^выда/i.test(carrier))
    return "Выдано в Ростове-на-Дону";
  if (dispatchDate !== null || carrier !== null)
    return "Отправлено из Ростова-на-Дону";
  return "Прибыло в Ростов-на-Дону, готовится к отправке";
}

/** The managers' colour meanings, as the customer reads them. */
const PROMO_STATUS_TEXT = {
  ORDER_PLACED: "Заказ оформлен",
  SHIPPED_BY_STORE: "Отправлен магазином",
  PROCESSED_IN_ROSTOV: "Получен и обработан в Ростове-на-Дону",
  DELIVERED: "Доставлен",
  CANCELLED: "Отменён",
} satisfies Record<PromoOrderStatus, string>; // a new status without a text is a compile error

/** Customer-facing text for a promo order status; no colour → still being processed. */
export function promoStatusText(status: PromoOrderStatus | null): string {
  return status === null ? "Заказ обрабатывается" : PROMO_STATUS_TEXT[status];
}
