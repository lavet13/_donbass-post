/**
 * Available notification endpoint types
 */
export const NotificationTypes = {
  ONLINE_PICKUP_RF: "online-pickup-rf",
  PICK_UP_POINT_DELIVERY: "pick-up-point-delivery-order",
  ALI_PARCEL_PICKUP: "ali-parcel-pickup",
  ORDER_ONLINE_PAY: "order-online-pay",
} as const;

export type NotificationType =
  (typeof NotificationTypes)[keyof typeof NotificationTypes];

/**
 * Human-readable names for notification types
 */
export const NotificationTypeNames: Record<NotificationType, string> = {
  [NotificationTypes.ONLINE_PICKUP_RF]: "Онлайн-забор по РФ",
  [NotificationTypes.PICK_UP_POINT_DELIVERY]: "Забор груза ЛДНР/Запорожье",
  [NotificationTypes.ALI_PARCEL_PICKUP]: "Забор посылки AliExpress",
  [NotificationTypes.ORDER_ONLINE_PAY]: "Оплата за доставку ОНЛАЙН",
};
