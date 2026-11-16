const rules = new Intl.PluralRules("ru");

export type RuForms = { one: string; few: string; many: string };

/**
 * A count with its noun in the right form: "1 строка", "2 строки", "5 строк",
 * "21 строка". The form follows the number's last digits; the number gets
 * Russian digit grouping ("21 460", with a non-breaking space).
 */
export function ruCount(n: number, forms: RuForms): string {
  const category = rules.select(n);
  const form =
    category === "one"
      ? forms.one
      : category === "few"
        ? forms.few
        : forms.many;
  return `${n.toLocaleString("ru-RU")} ${form}`;
}
