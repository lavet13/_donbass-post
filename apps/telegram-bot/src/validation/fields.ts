import { z } from "zod";
import { isPossiblePhoneNumber } from "libphonenumber-js";

// ======== Helpers =====================================================

/**
 * Phone validation for RU numbers. `defaultCountry: "RU"` lets national formats parse,
 * so all of these PASS (formatting chars are ignored):
 *   "+79991234567"          international, no spaces
 *   "89991234567"           national, leading 8
 *   "9991234567"            bare 10-digit national
 *   "+7 (999) 123-45-67"    masked (what the form's Inputmask produces)
 *   "8 (999) 123-45-67"     masked, leading 8
 * FAIL: fewer than ~10 digits, or non-RU numbers without a valid country prefix.
 * Note: this checks length plausibility, not that the number is real
 * (isPossible ≠ isValid). The form submits the MASKED string; that's fine — the
 * library strips parens/spaces/dashes before checking.
 */
export const phoneSchema = (
  required: string | undefined = "Телефон не может быть пустым",
  filled: string | undefined = "Заполните телефон полностью!",
) =>
  z
    .string({ error: required })
    .refine((val) => isPossiblePhoneNumber(val, { defaultCountry: "RU" }), {
      error: filled,
    });
export const emailSchema = z.email({ pattern: z.regexes.email });

export const text = (minNum: number, required: string, minMsg: string) =>
  z.string({ error: required }).trim().min(1, required).min(minNum, minMsg);

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

function validatePickupTime(value: string | undefined): string | undefined {
  if (!value) {
    return "Пожалуйста, укажите время";
  }

  const timeRangeRegex = /^(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})$/;
  const match = value.match(timeRangeRegex);

  if (!match) {
    return "Некорректный формат времени(пример: 10:00 - 12:00)";
  }

  const [, sh, sm, eh, em] = match;
  const startHour = Number(sh); // groups are always the 2-digit strings
  const startMin = Number(sm);
  const endHour = Number(eh);
  const endMin = Number(em);

  // Validate hours and minutes
  if (startHour > 23 || endHour > 23 || startMin > 59 || endMin > 59) {
    return "Некорректное время";
  }

  // Convert to minutes for comparison
  const startTimeInMinutes = startHour * 60 + startMin;
  const endTimeInMinutes = endHour * 60 + endMin;

  // Check if end time is after start time
  if (endTimeInMinutes <= startTimeInMinutes) {
    return "Время окончания должно быть позже времени начала";
  }

  // Check if the range is at least 2 hours (120 minutes)
  const diffInMinutes = Math.abs(endTimeInMinutes - startTimeInMinutes);
  if (diffInMinutes < 120) {
    return "Промежуток времени должен быть не менее 2-х часов";
  }

  return undefined;
}
