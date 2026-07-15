import type {
  AliParcelPickupPayload,
  OnlinePickupPayload,
  PickUpPointDeliveryOrderPayload,
} from "@/notifications/types";
import { formatRussianDateTime } from "@/utils/date";

export function formatOnlinePickupMessage(
  payload: OnlinePickupPayload,
): string {
  const lines: string[] = [
    "📦 <b>Новая заявка на онлайн-забор по РФ</b>",
    "",
    "👤 <b>Отправитель:</b>",
    `ФИО: ${payload.surnameSender} ${payload.nameSender} ${payload.patronymicSender}`,
    `📱 Телефон: ${payload.phoneSender}`,
  ];

  // Contact preferences for sender
  const senderPrefs: string[] = [];
  if (payload.telegramSender) senderPrefs.push("Telegram");
  if (payload.whatsAppSender) senderPrefs.push("MAX"); // was whatsappSender — casing typo
  if (senderPrefs.length > 0) {
    lines.push(`💬 Предпочтения: ${senderPrefs.join(", ")}`);
  }

  lines.push(
    "",
    "📍 <b>Забор посылки:</b>",
    `Город/Регион: ${payload.cityRegion}`,
    `Адрес: ${payload.pickupAddress}`,
    `⏰ Время: ${payload.pickupTime}`,
    "",
    "📦 <b>Информация о посылке:</b>",
    `Вес: ${payload.totalWeight} кг`,
    `Объем: ${payload.cubicMeter} м³`,
  );

  if (payload.long && payload.width && payload.height) {
    lines.push(
      `Размеры: ${payload.long} × ${payload.width} × ${payload.height} см`,
    );
  }

  lines.push(
    `Описание: ${payload.description}`,
    "",
    "👥 <b>Получатель:</b>",
    `ФИО: ${payload.surnameRecipient} ${payload.nameRecipient} ${payload.patronymicRecipient}`,
    `📱 Телефон: ${payload.phoneRecipient}`,
    `📧 Email: ${payload.emailRecipient}`,
  );

  // Contact preferences for recipient
  const recipientPrefs: string[] = [];
  if (payload.telegramRecipient) recipientPrefs.push("Telegram");
  if (payload.whatsAppRecipient) recipientPrefs.push("WhatsApp"); // was whatsappRecipient
  if (recipientPrefs.length > 0) {
    lines.push(`💬 Предпочтения: ${recipientPrefs.join(", ")}`);
  }

  // Delivery: XOR'd by the schema — exactly one of these is present.
  // `!== undefined` not `!!`: pointTo is a number, and !!0 is false.
  if (payload.pointTo !== undefined) {
    lines.push(`📍 Пункт выдачи: ${payload.pointTo}`);
  } else if (payload.pickupAddressRecipient !== undefined) {
    lines.push(`📍 Адрес доставки: ${payload.pickupAddressRecipient}`);
  }

  lines.push(`💰 Оплата доставки: ${payload.shippingPayment}`);

  // Customer: the schema's refine makes this all-or-nothing (0 or 4 fields),
  // so one check answers for the whole group.
  if (payload.nameCustomer) {
    lines.push(
      "",
      "💼 <b>Заказчик:</b>",
      `ФИО: ${payload.surnameCustomer} ${payload.nameCustomer} ${payload.patronymicCustomer}`,
      `📱 Телефон: ${payload.phoneCustomer}`,
    );
  }

  lines.push("", `🕐 Время: ${formatRussianDateTime(new Date())}`);

  return lines.join("\n");
}

/**
 * Format pick-up point delivery order message
 */
export function formatPickUpPointDeliveryOrderMessage(
  payload: PickUpPointDeliveryOrderPayload,
): string {
  const lines: string[] = [
    "📦 <b>Новая заявка на забор груза по ЛДНР и Запорожье</b>",
    "",
  ];

  // ---- Sender: sibling keys, exactly one present (schema refine) -------------
  lines.push("👤 <b>Отправитель:</b>");

  if (payload.sender) {
    // Physical person. Inside this branch TS knows every field is present —
    // no `|| ""` / `|| "—"` fallbacks needed; the schema guarantees them.
    lines.push(
      `ФИО: ${payload.sender.surnameSender} ${payload.sender.nameSender} ${payload.sender.patronymicSender}`,
    );

    const senderPrefs: string[] = [];
    if (payload.sender.telegramSender) senderPrefs.push("Telegram");
    if (payload.sender.whatsAppSender) senderPrefs.push("WhatsApp");
    if (senderPrefs.length > 0) {
      lines.push(`💬 Предпочтения: ${senderPrefs.join(", ")}`);
    }

    lines.push(`📧 Email: ${payload.sender.emailSender}`);
  } else if (payload.companySender) {
    // Company — companySender is now a SIBLING key, not a field inside sender.
    lines.push(
      `🏢 Компания: ${payload.companySender.companySender}`,
      `🆔 ИНН: <code>${payload.companySender.innSender}</code>`,
      `📧 Email: ${payload.companySender.emailSender}`,
    );
  }

  // Fields both branches share. `??` gives a union both members satisfy,
  // so this narrows honestly — no non-null assertion needed.
  const sender = payload.sender ?? payload.companySender;
  if (sender) {
    lines.push(
      `📱 Телефон: ${sender.phoneSender}`,
      `📍 Адрес забора: ${sender.pickupAddress}`,
      `🏙 Пункт отправления: ${sender.pointFrom}`,
    );
  }

  // ---- Recipient -----------------------------------------------------------
  lines.push("", "👥 <b>Получатель:</b>");

  if (payload.recipient) {
    lines.push(
      `ФИО: ${payload.recipient.surnameRecipient} ${payload.recipient.nameRecipient} ${payload.recipient.patronymicRecipient}`,
    );

    const recipientPrefs: string[] = [];
    if (payload.recipient.telegramRecipient) recipientPrefs.push("Telegram");
    if (payload.recipient.whatsAppRecipient) recipientPrefs.push("WhatsApp");
    if (recipientPrefs.length > 0) {
      lines.push(`💬 Предпочтения: ${recipientPrefs.join(", ")}`);
    }
  } else if (payload.companyRecipient) {
    lines.push(
      `🏢 Компания: ${payload.companyRecipient.companyRecipient}`,
      `🆔 ИНН: <code>${payload.companyRecipient.innRecipient}</code>`,
      `📧 Email: ${payload.companyRecipient.emailRecipient}`,
    );
  }

  const recipient = payload.recipient ?? payload.companyRecipient;
  if (recipient) {
    lines.push(
      `📱 Телефон: ${recipient.phoneRecipient}`,
      `📍 Адрес доставки: ${recipient.deliveryAddress}`,
      // BUG FIX: was printing payload.sender.pointFrom — the SENDER's point.
      `🏙 Пункт выдачи: ${recipient.pointTo}`,
    );

    if (recipient.deliveryCompany !== undefined) {
      lines.push(`🚚 Транспортная компания: ${recipient.deliveryCompany}`);
    }
  }

  // ---- Customer (optional; at most one of the two) --------------------------
  const customer = payload.customer ?? payload.companyCustomer;
  if (customer) {
    lines.push("", "💼 <b>Заказчик:</b>");

    if (payload.customer) {
      lines.push(
        `ФИО: ${payload.customer.surnameCustomer} ${payload.customer.nameCustomer} ${payload.customer.patronymicCustomer}`,
      );

      const customerPrefs: string[] = [];
      if (payload.customer.telegramCustomer) customerPrefs.push("Telegram");
      if (payload.customer.whatsAppCustomer) customerPrefs.push("WhatsApp");
      if (customerPrefs.length > 0) {
        lines.push(`💬 Предпочтения: ${customerPrefs.join(", ")}`);
      }
    } else if (payload.companyCustomer) {
      lines.push(
        `🏢 Компания: ${payload.companyCustomer.companyCustomer}`,
        `🆔 ИНН: <code>${payload.companyCustomer.innCustomer}</code>`,
        `📧 Email: ${payload.companyCustomer.emailCustomer}`,
      );
    }

    lines.push(`📱 Телефон: ${customer.phoneCustomer}`); // shared by both branches
  }

  // ---- Cargo ---------------------------------------------------------------
  lines.push(
    "",
    "📦 <b>Информация о грузе:</b>",
    `Описание: ${payload.cargoData.description}`,
    `Общий вес: ${payload.cargoData.totalWeight} кг`,
    `Вес самой тяжелой позиции: ${payload.cargoData.weightHeaviestPosition} кг`,
  );

  if (
    payload.cargoData.long &&
    payload.cargoData.width &&
    payload.cargoData.height
  ) {
    lines.push(
      `Размеры: ${payload.cargoData.long} × ${payload.cargoData.width} × ${payload.cargoData.height} см`,
    );
  }

  lines.push(
    `💎 Заявленная стоимость: ${payload.cargoData.declaredPrice} ₽`,
    `💰 Плательщик доставки: ${payload.cargoData.shippingPayment}`,
  );

  if (payload.cargoData.cashOnDelivery) {
    lines.push(`💵 Наложенный платеж: ${payload.cargoData.cashOnDelivery} ₽`);
  }

  // Additional services — the frontend sends { id } ONLY (no name/price).
  // `service.name` used to print `undefined`. See the todo about resolving names.
  if (payload.additionalService && payload.additionalService.length > 0) {
    lines.push(
      "",
      "➕ <b>Дополнительные услуги:</b>",
      ...payload.additionalService.map((service) => `  • Услуга #${service.id}`),
    );
  }

  lines.push("", `🕐 Время: ${formatRussianDateTime(new Date())}`);

  return lines.join("\n");
}

export function formatAliParcelPickupMessage(
  payload: AliParcelPickupPayload,
): string {
  const lines: string[] = [
    "📦 <b>Код и информация для забор заказа AliExpress</b>",
    "",
    `📍 <b>Адрес:</b> ${payload.address}`,
    `🔢 <b>Трек-номер:</b> <code>${payload.track}</code>`,
    `🔑 <b>Код получения:</b> <code>${payload.code}</code>`,
    `📱 <b>Телефон:</b> ${payload.phone}`,
    "",
    `🕐 Время: ${formatRussianDateTime(new Date())}`,
  ];

  return lines.join("\n");
}
