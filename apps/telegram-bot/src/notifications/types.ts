import { isPossiblePhoneNumber } from "libphonenumber-js";
import { z } from "zod";

// ======== Helpers =====================================================
export const phoneSchema = z
  .string({ error: "Заполните телефон!" })
  .refine((val) => isPossiblePhoneNumber(val), {
    error: "Проверьте правильно ли ввели номер телефона!",
  });
export const emailSchema = z.email({ pattern: z.regexes.email });

// Frontend repeats: !value.length -> "X обязательна", then length<3||>50 -> "X не должна быть...".
// One helper, two messages. .trim() first so "   " counts as empty (the form doesn't trim — we're stricter).
export const text3to50 = (required: string, range: string) =>
  z
    .string({ error: required })
    .trim()
    .min(1, required)
    .min(3, range)
    .max(50, range);

export const innSchema = z
  .string({ error: "ИНН обязателен" })
  .regex(/^\d{10,12}$/, "ИНН должен содержать от 10 до 12 цифр");

export const positive = (msg: string) => z.number({ error: msg }).positive(msg); // form: value <= 0 -> error

export const pickupTimeSchema = z
  .string({ error: "Пожалуйста, укажите время" })
  .superRefine((val, ctx) => {
    const message = validatePickupTime(val);

    if (message) ctx.addIssue({ code: "custom", message });
  });

// ====================== Main =============================================
const SenderIndividualObj = z.object({
  surnameSender: text3to50(
    "Фамилия обязательна",
    "Фамилия не должна быть короче 3 символов и длиннее 50",
  ),
  nameSender: text3to50(
    "Имя обязательно",
    "Имя не должно быть короче 3 символов и длиннее 50",
  ),
  patronymicSender: text3to50(
    "Отчество обязательно",
    "Отчество не должно быть короче 3 символов и длиннее 50",
  ),
  phoneSender: phoneSchema,
  telegramSender: z.boolean().default(false),
  whatsAppSender: z.boolean().default(false),
  pointFrom: z.number({ error: "Выберите населенный пункт" }).int(), // form sends parsed int
  pickupAddress: text3to50(
    "Адрес обязателен",
    "Адрес не должно быть короче 3 символов и длиннее 50",
  ),
  emailSender: emailSchema,
});

const SenderCompanyObj = z.object({
  companySender: text3to50(
    "Компания обязательна",
    "Компания не должна быть короче 3 символов и длиннее 50",
  ),
  phoneSender: phoneSchema,
  emailSender: emailSchema,
  pointFrom: z.number({ error: "Выберите населенный пункт" }).int(),
  pickupAddress: text3to50(
    "Адрес обязателен",
    "Адрес не должно быть короче 3 символов и длиннее 50",
  ),
  innSender: innSchema,
});

const RecipientIndividualObj = z.object({
  surnameRecipient: text3to50(
    "Фамилия обязательна",
    "Фамилия не должна быть короче 3 символов и длиннее 50",
  ),
  nameRecipient: text3to50(
    "Имя обязательно",
    "Имя не должно быть короче 3 символов и длиннее 50",
  ),
  patronymicRecipient: text3to50(
    "Отчество обязательно",
    "Отчество не должно быть короче 3 символов и длиннее 50",
  ),
  phoneRecipient: phoneSchema,
  telegramRecipient: z.boolean().default(false),
  whatsAppRecipient: z.boolean().default(false),
  deliveryCompany: z.number().int().optional(), // form has NO validator here -> optional
  deliveryAddress: text3to50(
    "Адрес получателя или ТК обязателен",
    "Адрес получателя или ТК не должно быть короче 3 символов и длиннее 50",
  ),
  pointTo: z.number({ error: "Выберите населенный пункт" }).int(),
});

const RecipientCompanyObj = z.object({
  companyRecipient: text3to50(
    "Компания обязательна",
    "Компания не должна быть короче 3 символов и длиннее 50",
  ),
  phoneRecipient: phoneSchema,
  emailRecipient: emailSchema,
  deliveryAddress: text3to50(
    "Адрес обязателен",
    "Адрес не должно быть короче 3 символов и длиннее 50",
  ),
  innRecipient: innSchema,
  deliveryCompany: z.number().int().optional(),
  pointTo: z.number({ error: "Выберите населенный пункт" }).int(),
});

const CustomerIndividualObj = z.object({
  surnameCustomer: text3to50(
    "Фамилия обязательна",
    "Фамилия не должна быть короче 3 символов и длиннее 50",
  ),
  nameCustomer: text3to50(
    "Имя обязательно",
    "Имя не должно быть короче 3 символов и длиннее 50",
  ),
  patronymicCustomer: text3to50(
    "Отчество обязательно",
    "Отчество не должно быть короче 3 символов и длиннее 50",
  ),
  phoneCustomer: phoneSchema,
  telegramCustomer: z.boolean().default(false),
  whatsAppCustomer: z.boolean().default(false),
});

const CustomerCompanyObj = z.object({
  companyCustomer: text3to50(
    "Компания обязательна",
    "Компания не должна быть короче 3 символов и длиннее 50",
  ),
  phoneCustomer: phoneSchema,
  emailCustomer: emailSchema,
  innCustomer: innSchema,
});

const CargoData = z.object({
  // Form offers exactly three payers -> z.enum beats z.string(): it rejects garbage AND
  // z.infer narrows the type to the literal union instead of `string`.
  shippingPayment: z.enum(["Отправитель", "Получатель", "Третье лицо"], {
    error: "Выберите плательщика доставки",
  }),
  description: text3to50(
    "Заполните краткое описание",
    "Краткое описание не должно быть короче 3 символов и длиннее 50",
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

export const PickUpPointDeliverySchema = z
  .object({
    sender: SenderIndividualObj.optional(), // the INNER objects, not the wrappers
    companySender: SenderCompanyObj.optional(),
    recipient: RecipientIndividualObj.optional(),
    companyRecipient: RecipientCompanyObj.optional(),
    customer: CustomerIndividualObj.optional(),
    companyCustomer: CustomerCompanyObj.optional(),
    cargoData: CargoData,
    additionalService: z.array(z.object({ id: z.number() })).optional(),
    timestamp: z.string().default(() => new Date().toISOString()),
    source: z.string().default("web"),
  })
  // XOR in JS is just: boolean !== boolean. Exactly one truthy → true; both or neither → false.
  .refine((d) => !!d.sender !== !!d.companySender, {
    error:
      "Укажите отправителя: либо физ. лицо (sender), либо компанию (companySender), но не оба",
    path: ["sender"],
  })
  .refine((d) => !!d.recipient !== !!d.companyRecipient, {
    error:
      "Укажите получателя: либо recipient, либо companyRecipient, но не оба",
    path: ["recipient"],
  })
  // customer is OPTIONAL: neither is fine, but not both.
  // The !(a && b) "at most one" pattern you asked about is on the cheat-sheet card,
  // framed as "optional but mutually exclusive"
  .refine((d) => !(d.customer && d.companyCustomer), {
    error:
      "Заказчик: укажите либо физ.лицо (customer), либо компанию (companyCustomer), но не оба",
    path: ["customer"],
  });

export type PickUpPointDeliveryOrderPayload = z.infer<
  typeof PickUpPointDeliverySchema
>;

export const OnlinePickupSchema = z
  .object({
    // Sender information
    surnameSender: text3to50(
      "Фамилия обязательна",
      "Фамилия не должна быть короче 3 символов и длиннее 50",
    ),
    nameSender: text3to50(
      "Имя обязательно",
      "Имя не должно быть короче 3 символов и длиннее 50",
    ),
    patronymicSender: text3to50(
      "Отчество обязательно",
      "Отчество не должно быть короче 3 символов и длиннее 50",
    ),
    phoneSender: phoneSchema,
    telegramSender: z.boolean().default(false),
    whatsAppSender: z.boolean().default(false),

    // Pickup details
    cityRegion: text3to50(
      "Город и область обязательно",
      "Город и область не должно быть короче 3 символов и длиннее 50",
    ),
    pickupAddress: text3to50(
      "Заполните адрес забора",
      "Адрес забора не должен быть короче 3 символов и длиннее 50",
    ),
    pickupTime: pickupTimeSchema,

    // Package details
    totalWeight: positive("Заполните общий вес"),
    cubicMeter: positive("Должно быть больше нуля!").max(
      25,
      "Не должен превышать 25",
    ),
    description: text3to50(
      "Заполните краткое описание",
      "Краткое описание не должно быть короче 3 символов и длиннее 50",
    ),
    // Dimension helpers — no frontend validation; used only to compute cubicMeter.
    long: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),

    // Recipient information
    surnameRecipient: text3to50(
      "Фамилия обязательна",
      "Фамилия не должна быть короче 3 символов и длиннее 50",
    ),
    nameRecipient: text3to50(
      "Имя обязательно",
      "Имя не должно быть короче 3 символов и длиннее 50",
    ),
    patronymicRecipient: text3to50(
      "Отчество обязательно",
      "Отчество не должно быть короче 3 символов и длиннее 50",
    ),
    phoneRecipient: phoneSchema,
    emailRecipient: emailSchema,
    telegramRecipient: z.boolean().default(false),
    whatsAppRecipient: z.boolean().default(false),
    pointTo: z.number({ error: "Выберите населенный пункт" }).int().optional(),
    pickupAddressRecipient: text3to50(
      "Адрес обязателен",
      "Адрес не должно быть короче 3 символов и длиннее 50",
    ).optional(),
    shippingPayment: z.enum(["Отправитель", "Получатель", "Третье лицо"], {
      error: "Выберите плательщика доставки",
    }),

    // Customer information (optional)
    surnameCustomer: text3to50(
      "Фамилия обязательна",
      "Фамилия не должна быть короче 3 символов и длиннее 50",
    ).optional(),
    nameCustomer: text3to50(
      "Имя обязательно",
      "Имя не должно быть короче 3 символов и длиннее 50",
    ).optional(),
    patronymicCustomer: text3to50(
      "Отчество обязательно",
      "Отчество не должно быть короче 3 символов и длиннее 50",
    ).optional(),
    phoneCustomer: phoneSchema.optional(),

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
  address: text3to50(
    "Адрес обязателен!",
    "Адрес должен содержать от 3 до 50 символов",
  ),
  track: text3to50(
    "Трек обязателен!",
    "Трек должен содержать от 3 до 50 символов",
  ),
  code: text3to50(
    "Код обязателен!",
    "Код должен содержать от 3 до 50 символов",
  ),
  phone: phoneSchema,
  timestamp: z.string().default(() => new Date().toISOString()),
  source: z.string().default("web"),
});

export type AliParcelPickupPayload = z.infer<typeof AliParcelPickupSchema>;

function validatePickupTime(value: string | undefined): string | undefined {
  if (!value) {
    return "Пожалуйста, укажите время";
  }

  const match = value.match(/с\s*(\d{2}):(\d{2})\s*до\s*(\d{2}):(\d{2})/);

  if (!match) {
    return "Заполните до конца";
  }

  const [, startHour, startMinute, endHour, endMinute] = match;

  const startHourNum = parseInt(startHour!);
  const startMinuteNum = parseInt(startMinute!);
  const endHourNum = parseInt(endHour!);
  const endMinuteNum = parseInt(endMinute!);

  // Convert to minutes for comparison
  const startTotalMinutes = startHourNum * 60 + startMinuteNum;
  const endTotalMinutes = endHourNum * 60 + endMinuteNum;

  // Check if duration is at least 2 hours (120 minutes)
  const durationMinutes = Math.abs(endTotalMinutes - startTotalMinutes);
  if (durationMinutes < 120) {
    return "Промежуток времени должен быть не менее 2-х часов";
  }

  return undefined;
}
