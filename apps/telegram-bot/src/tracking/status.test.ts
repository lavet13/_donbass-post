import { describe, expect, it } from "vitest";
import { promoStatusText, rostovStatus } from "./status";

const utcDay = (iso: string) => new Date(`${iso}T00:00:00Z`);

describe("rostovStatus", () => {
  it.each([
    ["выдан", null, "Выдано в Ростове-на-Дону"], // 2018–2019 sheets
    ["СДЕК", utcDay("2026-07-05"), "Отправлено из Ростова-на-Дону"],
    ["СДЕК", null, "Отправлено из Ростова-на-Дону"], // carrier known, date missing
    [null, utcDay("2026-07-05"), "Отправлено из Ростова-на-Дону"],
    [null, null, "Прибыло в Ростов-на-Дону, готовится к отправке"],
  ] as const)("carrier %j, dispatched %j → %s", (carrier, dispatchDate, expected) => {
    expect(rostovStatus(carrier, dispatchDate)).toBe(expected);
  });
});

describe("promoStatusText", () => {
  it.each([
    ["PROCESSED_IN_ROSTOV", "Получен и обработан в Ростове-на-Дону"],
    ["CANCELLED", "Отменён"],
    [null, "Заказ обрабатывается"],
  ] as const)("%j → %s", (status, expected) => {
    expect(promoStatusText(status)).toBe(expected);
  });
});
