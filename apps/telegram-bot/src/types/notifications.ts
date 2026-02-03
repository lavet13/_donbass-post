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
 * Generic notification payload for other endpoints
 */
export interface GenericNotificationPayload extends BaseNotificationPayload {
  formType: string;
  data: Record<string, any>;
}
