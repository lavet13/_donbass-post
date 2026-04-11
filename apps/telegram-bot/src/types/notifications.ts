import { z } from "zod";
/**
 * Base notification payload
 */
export interface BaseNotificationPayload {
  timestamp?: string;
  source?: string;
}

/**
 * Online pickup notification payload
 */
export interface OnlinePickupPayload extends BaseNotificationPayload {
  // Sender information
  surnameSender: string;
  nameSender: string;
  patronymicSender: string;
  phoneSender: string;

  // Pickup details
  cityRegion: string;
  pickupAddress: string;
  pickupTime: string;

  // Package details
  totalWeight: number;
  cubicMeter: number;
  description: string;
  long?: number;
  width?: number;
  height?: number;

  // Recipient information
  surnameRecipient: string;
  nameRecipient: string;
  patronymicRecipient: string;
  phoneRecipient: string;
  emailRecipient: string;
  pointTo?: number;
  pickupAddressRecipient?: string;
  shippingPayment: string;

  // Customer information (optional)
  surnameCustomer?: string;
  nameCustomer?: string;
  patronymicCustomer?: string;
  phoneCustomer?: string;

  // Contact preferences
  telegramSender?: boolean;
  whatsappSender?: boolean;
  telegramRecipient?: boolean;
  whatsappRecipient?: boolean;
}

/**
 * Pick-up point delivery order payload
 */
export interface PickUpPointDeliveryOrderPayload extends BaseNotificationPayload {
  // Sender information
  sender: {
    // Physical person fields
    nameSender?: string;
    surnameSender?: string;
    patronymicSender?: string;
    telegramSender?: boolean;
    whatsAppSender?: boolean;
    emailSender?: string; // emailFizSender in form

    // Company fields
    companySender?: string;
    innSender?: string;

    // Common fields
    phoneSender: string;
    pickupAddress: string;
    pointFrom: string;
  };

  // Recipient information
  recipient: {
    // Physical person fields
    nameRecipient?: string;
    surnameRecipient?: string;
    patronymicRecipient?: string;
    telegramRecipient?: boolean;
    whatsAppRecipient?: boolean;

    // Company fields
    companyRecipient?: string;
    innRecipient?: string;
    emailRecipient?: string;

    // Common fields
    phoneRecipient: string;
    deliveryAddress: string;
    deliveryCompany?: string;
    pointTo?: string;
  };

  // Customer information (optional - third party payer)
  customer?: {
    // Physical person fields
    nameCustomer?: string;
    surnameCustomer?: string;
    patronymicCustomer?: string;
    telegramCustomer?: boolean;
    whatsAppCustomer?: boolean;

    // Company fields
    companyCustomer?: string;
    innCustomer?: string;
    emailCustomer?: string;

    // Common fields
    phoneCustomer: string;
  };

  // Cargo data
  cargoData: {
    shippingPayment: string; // "Отправитель" | "Получатель" | "Третье лицо"
    description: string;
    weightHeaviestPosition: number;
    totalWeight: number;
    declaredPrice: number;
    cashOnDelivery?: number;
    cubicMeter: number;
    long?: number;
    width?: number;
    height?: number;
  };

  // Additional services
  additionalService?: Array<{
    id: number;
    name: string;
    price: number;
  }>;
}

export const phoneRuSchema = z
  .string({ error: "Заполните телефон!" })
  .regex(/^\+7\d{10,}$/, "Телефон должен быть в формате +7XXXXXXXXXX");

export const AliParcelPickupSchema = z.object({
  address: z
    .string({ error: "Адрес обязателен!" })
    .trim()
    .min(1, "Адрес обязателен!")
    .min(3, "Адрес должен содержать от 3 до 50 символов")
    .max(50, "Адрес должен содержать от 3 до 50 символов"),
  track: z
    .string({ error: "Трек обязателен!" })
    .trim()
    .min(1, "Трек обязателен!")
    .min(3, "Трек должен содержать от 3 до 50 символов")
    .max(50, "Трек должен содержать от 3 до 50 символов"),
  code: z
    .string({ error: "Код обязателен!" })
    .trim()
    .min(1, "Код обязателен!")
    .min(3, "Код должен содержать от 3 до 50 символов")
    .max(50, "Код должен содержать от 3 до 50 символов"),
  phone: phoneRuSchema,
});

export type AliParcelPickupPayload = z.infer<typeof AliParcelPickupSchema> &
  BaseNotificationPayload;
