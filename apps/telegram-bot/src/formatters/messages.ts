import type { OnlinePickupPayload } from "@/types/notifications";
import { formatRussianDateTime } from "@/utils";

export function formatOnlinePickupMessage(
  payload: OnlinePickupPayload,
): string {
  const lines: string[] = [
    "📦 <b>Новая заявка на онлайн-забор по РФ</b>",
    "",
    "👤 <b>Отправитель:</b>",
    `ФИО: ${payload.surnameSender} ${payload.nameSender} ${payload.patronymicSender}`,
    `📱 Телефон: <code>${payload.phoneSender}</code>`,
  ];

  // Contact preferences for sender
  const senderPrefs: string[] = [];
  if (payload.telegramSender) senderPrefs.push("Telegram");
  if (payload.whatsappSender) senderPrefs.push("WhatsApp");
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
    `📱 Телефон: <code>${payload.phoneRecipient}</code>`,
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
  if (payload.surnameCustomer && payload.nameCustomer) {
    lines.push(
      "",
      "💼 <b>Заказчик:</b>",
      `ФИО: ${payload.surnameCustomer} ${payload.nameCustomer} ${payload.patronymicCustomer || ""}`,
      `📱 Телефон: <code>${payload.phoneCustomer || "—"}</code>`,
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
  data: Record<string, any>
): string {
  const lines: string[] = [
    `📝 <b>Новая заявка: ${formType}</b>`,
    "",
  ];

  // Format data fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      const formattedKey = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, str => str.toUpperCase());

      lines.push(`<b>${formattedKey}:</b> ${value}`);
    }
  });

  lines.push(
    "",
    `🕐 Время: ${formatRussianDateTime(new Date())}`,
  );

  return lines.join("\n");
}
