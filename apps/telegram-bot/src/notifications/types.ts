import {
  emailSchema,
  innSchema,
  phoneSchema,
  pickupTimeSchema,
  positive,
  text,
} from "@/validation/fields";
import { z } from "zod";

const SenderIndividualObj = z.object({
  surnameSender: text(
    2,
    "Фамилия отправителя не может быть пустым!",
    "Минимальная длина фамилии отправителя 2 символа!",
  ),
  nameSender: text(
    2,
    "Имя отправителя не может быть пустым!",
    "Минимальная длина имени отправителя 2 символа!",
  ),
  patronymicSender: text(
    2,
    "Отчество отправителя обязательно!",
    "Минимальная длина отчества отправителя 2 символа!",
  ),
  phoneSender: phoneSchema("Телефон отправителя не может быть пустым!"),
  telegramSender: z.boolean().default(false),
  whatsAppSender: z.boolean().default(false),
  pointFrom: z
    .string({ error: "Выберите населенный пункт" })
    .min(1, "Выберите населенный пункт"),
  pickupAddress: text(
    2,
    "Адрес доставки груза не может быть пустым!",
    "Минимальная длина адреса забора груза 2 символа!",
  ),
  emailSender: emailSchema,
});

const SenderCompanyObj = z.object({
  companySender: text(
    2,
    "Компания должна быть заполнена!",
    "Минимальная длина компании 2 символа!",
  ),
  phoneSender: phoneSchema("Телефон отправителя не может быть пустым!"),
  emailSender: emailSchema,
  pointFrom: z
    .string({ error: "Выберите населенный пункт" })
    .min(1, "Выберите населенный пункт"),
  pickupAddress: text(
    2,
    "Адрес доставки груза не может быть пустым!",
    "Минимальная длина адреса забора груза 2 символа!",
  ),
  innSender: innSchema,
});

const RecipientIndividualObj = z.object({
  surnameRecipient: text(
    2,
    "Фамилия получателя не может быть пустым!",
    "Минимальная длина фамилии получателя 2 символа!",
  ),
  nameRecipient: text(
    2,
    "Имя получателя не может быть пустым!",
    "Минимальная длина имени получателя 2 символа!",
  ),
  patronymicRecipient: text(
    2,
    "Отчество получателя обязательно!",
    "Минимальная длина отчества получателя 2 символа!",
  ),
  phoneRecipient: phoneSchema("Телефон получателя не может быть пустым!"),
  telegramRecipient: z.boolean().default(false),
  whatsAppRecipient: z.boolean().default(false),
  deliveryCompany: z
    .string({ error: "Транспортная компания должна быть заполнена!" })
    .min(1, { error: "Транспортная компания должна быть заполнена!" })
    .optional(),
  deliveryAddress: text(
    2,
    "Адрес получателя или ТК",
    "Минимальная длина адреса доставки груза 2 символа!",
  ),
  pointTo: z
    .string({ error: "Выберите населенный пункт" })
    .min(1, "Выберите населенный пункт")
    .optional(),
});

const RecipientCompanyObj = z.object({
  companyRecipient: text(
    2,
    "Компания не может быть пустой!",
    "Минимальная длина компании 2 символа!",
  ),
  phoneRecipient: phoneSchema("Телефон получателя не может быть пустым!"),
  emailRecipient: emailSchema,
  deliveryAddress: text(
    2,
    "Адрес получателя или ТК",
    "Минимальная длина адреса доставки груза 2 символа!",
  ),
  innRecipient: innSchema,
  deliveryCompany: z
    .string({ error: "Транспортная компания должна быть заполнена!" })
    .min(1, { error: "Транспортная компания должна быть заполнена!" })
    .optional(),
  pointTo: z
    .string({ error: "Выберите населенный пункт" })
    .min(1, "Выберите населенный пункт")
    .optional(),
});

const CustomerIndividualObj = z.object({
  surnameCustomer: text(
    2,
    "Фамилия заказчика не может быть пустым!",
    "Минимальная длина фамилии заказчика 2 символа!",
  ),
  nameCustomer: text(
    2,
    "Имя заказчика не может быть пустым!",
    "Минимальная длина имени заказчика 2 символа!",
  ),
  patronymicCustomer: text(
    2,
    "Отчество заказчика обязательно!",
    "Минимальная длина отчества заказчика 2 символа!",
  ),
  phoneCustomer: phoneSchema("Телефон заказчика не может быть пустым!"),
  telegramCustomer: z.boolean().default(false),
  whatsAppCustomer: z.boolean().default(false),
});

const CustomerCompanyObj = z.object({
  companyCustomer: text(
    2,
    "Компания не может быть пустой!",
    "Минимальная длина компании 2 символа!",
  ),
  phoneCustomer: phoneSchema("Телефон заказчика не может быть пустым!"),
  emailCustomer: emailSchema,
  innCustomer: innSchema,
});

const CargoData = z.object({
  shippingPayment: z
    .string({ error: "Выберите плательщика доставки" })
    .min(1, "Выберите плательщика доставки"),
  description: text(
    2,
    "Заполните краткое описание!",
    "Минимальная длина описания 2 символа!",
  ),
  weightHeaviestPosition: positive("Заполните вес самой тяжелой позиции"),
  totalWeight: positive("Заполните общий вес"),
  declaredPrice: positive("Заполните заявленную стоимость"),
  cubicMeter: positive("Должно быть больше нуля!").max(
    25,
    "Не должен превышать 25",
  ),
  cashOnDelivery: positive("Укажите наложенный платеж").optional(), // form validates only when present
  // Dimension helpers — no frontend validation; used only to compute cubicMeter.
  long: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const PickUpPointDeliverySchema = z.object({
  sender: z.union([SenderIndividualObj, SenderCompanyObj]),
  recipient: z.union([RecipientIndividualObj, RecipientCompanyObj]),
  customer: z.union([CustomerIndividualObj, CustomerCompanyObj]).optional(),
  cargoData: CargoData,
  additionalService: z
    .array(
      z.object({ id: z.number(), name: z.string(), price: z.number().int() }),
    )
    .optional(),
  timestamp: z.string().default(() => new Date().toISOString()),
  source: z.string().default("web"),
});

export type PickUpPointDeliveryOrderPayload = z.infer<
  typeof PickUpPointDeliverySchema
>;

export const OnlinePickupSchema = z
  .object({
    // Sender information
    surnameSender: text(
      2,
      "Фамилия отправителя обязательна!",
      "Минимальная длина фамилии отправителя 2 символа!",
    ),
    nameSender: text(
      2,
      "Имя отправителя обязательно!",
      "Минимальная длина имени отправителя 2 символа!",
    ),
    patronymicSender: text(
      2,
      "Отчество отправителя обязательно!",
      "Минимальная длина отчества отправителя 2 символа!",
    ),
    phoneSender: phoneSchema("Телефон отправителя не может быть пустым!"),
    telegramSender: z.boolean().default(false),
    whatsAppSender: z.boolean().default(false),

    // Pickup details
    cityRegion: text(
      2,
      "Заполните город и область",
      "Минимальная длина города/области 2 символа!",
    ),
    pickupAddress: text(
      5,
      "Заполните адрес забора",
      "Минимальная длина адреса забора 5 символов!",
    ),
    pickupTime: pickupTimeSchema,

    // Package details
    totalWeight: positive("Заполните общий вес"),
    cubicMeter: positive("Должно быть больше нуля!").max(
      25,
      "Не должен превышать 25",
    ),
    description: z.string({ error: "Это не строка!" }).optional(),
    // Dimension helpers — no frontend validation; used only to compute cubicMeter.
    long: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),

    // Recipient information
    surnameRecipient: text(
      2,
      "Фамилия получателя обязательна",
      "Минимальная длина фамилии получателя 2 символа!",
    ),
    nameRecipient: text(
      2,
      "Имя обязательно",
      "Минимальная длина имени получателя 2 символа!",
    ),
    patronymicRecipient: text(
      2,
      "Отчество обязательно",
      "Минимальная длина отчества получателя 2 символа!",
    ),
    phoneRecipient: phoneSchema("Телефон получателя не может быть пустым!"),
    emailRecipient: emailSchema,
    telegramRecipient: z.boolean().default(false),
    whatsAppRecipient: z.boolean().default(false),
    pointTo: z
      .string({ error: "Выберите населенный пункт" })
      .min(1, "Выберите населенный пункт")
      .optional(),
    pickupAddressRecipient: text(
      2,
      "Адрес обязателен",
      "Минимальная длина адреса доставки 2 символа!",
    ).optional(),
    shippingPayment: z
      .string({ error: "Выберите плательщика доставки" })
      .min(1, "Выберите плательщика доставки"),

    // Customer information (optional)
    surnameCustomer: text(
      2,
      "Фамилия заказчика обязательна!",
      "Минимальная длина фамилии заказчика 2 символа!",
    ).optional(),
    nameCustomer: text(
      2,
      "Имя заказчика обязательна!",
      "Минимальная длина имени заказчика 2 символа!",
    ).optional(),
    patronymicCustomer: text(
      2,
      "Отчество заказчика обязательно!",
      "Минимальная длина отчества заказчика 2 символа!",
    ).optional(),
    phoneCustomer: phoneSchema().optional(),

    timestamp: z.string().default(() => new Date().toISOString()),
    source: z.string().default("web"),
  })
  .refine(
    (d) => {
      // Frontend toggles these 4 as one unit → 0 (not toggled) or 4 (toggled). Nothing between.
      const filled = [
        d.surnameCustomer,
        d.nameCustomer,
        d.patronymicCustomer,
        d.phoneCustomer,
      ].filter(Boolean).length;
      return filled === 0 || filled === 4;
    },
    {
      error:
        "Заказчик: заполните все поля (фамилия, имя, отчество, телефон) или ни одного",
      path: ["nameCustomer"],
    },
  )
  .refine(
    // XOR
    // Note !== undefined instead of !! — !!0 is false, so a pointTo of 0 would read as absent.
    // Same falsy trap as if (!chatId). For numbers, always test undefined explicitly.
    (d) =>
      (d.pointTo !== undefined) !== (d.pickupAddressRecipient !== undefined),
    {
      error:
        "Укажите либо пункт выдачи (pointTo), либо адрес доставки (pickupAddressRecipient)",
      path: ["pointTo"],
    },
  );

export type OnlinePickupPayload = z.infer<typeof OnlinePickupSchema>;

export const AliParcelPickupSchema = z.object({
  address: text(3, "Адрес обязателен!", "Минимальная длина адреса 3 символа!"),
  track: text(3, "Трек обязателен!", "Минимальная длина трека 3 символа!"),
  code: text(3, "Код обязателен!", "Минимальная длина кода 3 символа!"),
  phone: phoneSchema(),
  timestamp: z.string().default(() => new Date().toISOString()),
  source: z.string().default("web"),
});

export type AliParcelPickupPayload = z.infer<typeof AliParcelPickupSchema>;
