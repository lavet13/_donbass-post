import type {
  OnlinePickupPayload,
  PickUpPointDeliveryOrderPayload,
} from "@/types/notifications";
import { formatRussianDateTime } from "@/utils";

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
  if (payload.whatsappSender) senderPrefs.push("MAX");
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
  if (payload.whatsappRecipient) recipientPrefs.push("WhatsApp");
  if (recipientPrefs.length > 0) {
    lines.push(`💬 Предпочтения: ${recipientPrefs.join(", ")}`);
  }

  // Delivery address
  if (payload.pointTo) {
    lines.push(`📍 Пункт выдачи: ${payload.pointTo}`);
  } else if (payload.pickupAddressRecipient) {
    lines.push(`📍 Адрес доставки: ${payload.pickupAddressRecipient}`);
  }

  lines.push(`💰 Оплата доставки: ${payload.shippingPayment}`);

  // Customer information (if provided)
  if (
    payload.surnameCustomer ||
    payload.nameCustomer ||
    payload.patronymicCustomer
  ) {
    lines.push(
      "",
      "💼 <b>Заказчик:</b>",
      `ФИО: ${payload.surnameCustomer} ${payload.nameCustomer} ${payload.patronymicCustomer}`,
      `📱 Телефон: ${payload.phoneCustomer || "—"}`,
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

  // Sender information
  lines.push("👤 <b>Отправитель:</b>");

  if (payload.sender.nameSender && payload.sender.surnameSender) {
    // Physical person
    lines.push(
      `ФИО: ${payload.sender.surnameSender} ${payload.sender.nameSender} ${payload.sender.patronymicSender || ""}`,
    );

    const senderPrefs: string[] = [];
    if (payload.sender.telegramSender) senderPrefs.push("Telegram");
    if (payload.sender.whatsAppSender) senderPrefs.push("WhatsApp");
    if (senderPrefs.length > 0) {
      lines.push(`💬 Предпочтения: ${senderPrefs.join(", ")}`);
    }

    if (payload.sender.emailSender) {
      lines.push(`📧 Email: ${payload.sender.emailSender}`);
    }
  } else if (payload.sender.companySender) {
    // Company
    lines.push(
      `🏢 Компания: ${payload.sender.companySender}`,
      `🆔 ИНН: <code>${payload.sender.innSender || "—"}</code>`,
      `📧 Email: ${payload.sender.emailSender || "—"}`,
    );
  }

  lines.push(
    `📱 Телефон: ${payload.sender.phoneSender}`,
    `📍 Адрес забора: ${payload.sender.pickupAddress}`,
    `🏙 Пункт отправления: ${payload.sender.pointFrom}`,
  );

  // Recipient information
  lines.push("", "👥 <b>Получатель:</b>");

  if (payload.recipient.nameRecipient && payload.recipient.surnameRecipient) {
    // Physical person
    lines.push(
      `ФИО: ${payload.recipient.surnameRecipient} ${payload.recipient.nameRecipient} ${payload.recipient.patronymicRecipient || ""}`,
    );

    const recipientPrefs: string[] = [];
    if (payload.recipient.telegramRecipient) recipientPrefs.push("Telegram");
    if (payload.recipient.whatsAppRecipient) recipientPrefs.push("WhatsApp");
    if (recipientPrefs.length > 0) {
      lines.push(`💬 Предпочтения: ${recipientPrefs.join(", ")}`);
    }
  } else if (payload.recipient.companyRecipient) {
    // Company
    lines.push(
      `🏢 Компания: ${payload.recipient.companyRecipient}`,
      `🆔 ИНН: <code>${payload.recipient.innRecipient || "—"}</code>`,
      `📧 Email: ${payload.recipient.emailRecipient || "—"}`,
    );
  }

  lines.push(
    `📱 Телефон: ${payload.recipient.phoneRecipient}`,
    `📍 Адрес доставки: ${payload.recipient.deliveryAddress}`,
  );

  if (payload.recipient.pointTo) {
    lines.push(`🏙 Пункт выдачи: ${payload.sender.pointFrom}`);
  }

  if (payload.recipient.deliveryCompany) {
    lines.push(
      `🚚 Транспортная компания: ${payload.recipient.deliveryCompany}`,
    );
  }

  // Customer information (if provided)
  if (payload.customer) {
    lines.push("", "💼 <b>Заказчик:</b>");

    if (payload.customer.nameCustomer && payload.customer.surnameCustomer) {
      // Physical person
      lines.push(
        `ФИО: ${payload.customer.surnameCustomer} ${payload.customer.nameCustomer} ${payload.customer.patronymicCustomer || ""}`,
      );

      const customerPrefs: string[] = [];
      if (payload.customer.telegramCustomer) customerPrefs.push("Telegram");
      if (payload.customer.whatsAppCustomer) customerPrefs.push("WhatsApp");
      if (customerPrefs.length > 0) {
        lines.push(`💬 Предпочтения: ${customerPrefs.join(", ")}`);
      }
    } else if (payload.customer.companyCustomer) {
      // Company
      lines.push(
        `🏢 Компания: ${payload.customer.companyCustomer}`,
        `🆔 ИНН: <code>${payload.customer.innCustomer || "—"}</code>`,
        `📧 Email: ${payload.customer.emailCustomer || "—"}`,
      );
    }

    lines.push(`📱 Телефон: ${payload.customer.phoneCustomer}`);
  }

  // Cargo data
  lines.push(
    "",
    "📦 <b>Информация о грузе:</b>",
    `Описание: ${payload.cargoData.description}`,
    `⚖️ Общий вес: ${payload.cargoData.totalWeight} кг`,
    `⚖️ Вес самой тяжелой позиции: ${payload.cargoData.weightHeaviestPosition} кг`,
    `📐 Объем: ${payload.cargoData.cubicMeter} м³`,
    `💎 Заявленная стоимость: ${payload.cargoData.declaredPrice} ₽`,
    `💰 Плательщик доставки: ${payload.cargoData.shippingPayment}`,
  );

  if (payload.cargoData.cashOnDelivery) {
    lines.push(`💵 Наложенный платеж: ${payload.cargoData.cashOnDelivery} ₽`);
  }

  // Additional services
  if (payload.additionalService && payload.additionalService.length > 0) {
    lines.push(
      "",
      "➕ <b>Дополнительные услуги:</b>",
      ...payload.additionalService.map(
        (service) => `  • Услуга: ${service.name}`,
      ),
    );
  }

  lines.push("", `🕐 Время: ${formatRussianDateTime(new Date())}`);

  return lines.join("\n");
}

/**
 * Format generic notification message
 *
 * Use this for simple forms or as a fallback
 */
export function formatGenericMessage(
  formType: string,
  data: Record<string, any>,
): string {
  const lines: string[] = [`📝 <b>Новая заявка: ${formType}</b>`, ""];

  // Format data fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      const formattedKey = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());

      lines.push(`<b>${formattedKey}:</b> ${value}`);
    }
  });

  lines.push("", `🕐 Время: ${formatRussianDateTime(new Date())}`);

  return lines.join("\n");
}
