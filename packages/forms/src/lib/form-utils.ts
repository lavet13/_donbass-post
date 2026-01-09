export function transformApiErrorsToFormErrors(
  apiErrors: Record<string, string>,
) {
  if (!apiErrors || typeof apiErrors !== "object") {
    return {};
  }

  const formErrors: Record<string, string> = {};

  Object.entries(apiErrors).forEach(([fieldPath, errorMessage]) => {
    // Преобразуем путь из API формата в формат для формы
    // К примеру, shopCostCalculationOrderPosition.0.shop -> shopCostCalculationOrderPosition[0].shop
    const transformedPath = fieldPath.replace(/\.(\d+)\./, "[$1].");

    formErrors[transformedPath] = errorMessage;
  });

  return formErrors;
}

// Исходный regex из Zod:
// /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_'+\-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i;
export const getEmailErrorMessage = (email: string) => {
  if (!email || email.trim() === "") {
    return "Email обязателен для заполнения";
  }

  // Проверка: не может начинаться с точки (?!\.)
  if (email.startsWith(".")) {
    return "Email не может начинаться с точки";
  }

  // Проверка: не может содержать две точки подряд (?!.*\.\.)
  if (email.includes("..")) {
    return "Email не может содержать две точки подряд";
  }

  // Проверка наличия @
  if (!email.includes("@")) {
    return "Email должен содержать символ @";
  }

  // Разделение на части
  const atIndex = email.lastIndexOf("@"); // используем lastIndexOf для корректной обработки
  const localPart = email.slice(0, atIndex);
  const domainPart = email.slice(atIndex + 1);

  // Проверка локальной части: ([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]
  if (localPart.length === 0) {
    return "Email не может начинаться с символа @";
  }

  // Последний символ локальной части должен быть [A-Za-z0-9_+-]
  const lastLocalChar = localPart[localPart.length - 1];
  if (!/[A-Za-z0-9_+-]/.test(lastLocalChar)) {
    return "Локальная часть email должна заканчиваться латинской буквой, цифрой или символом _ + -";
  }

  // Все символы локальной части должны быть [A-Za-z0-9_'+\-\.]
  if (!/^[A-Za-z0-9_'+\-.]*$/.test(localPart)) {
    return "Локальная часть email может содержать только латинские буквы, цифры и символы: _ ' + - .";
  }

  // Проверка доменной части: ([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}
  if (domainPart.length === 0) {
    return "Email должен содержать доменную часть после @";
  }

  // Домен должен заканчиваться на доменную зону из минимум 2 букв
  const domainZoneMatch = domainPart.match(/\.([A-Za-z]{2,})$/);
  if (!domainZoneMatch) {
    return "Доменная часть должна заканчиваться доменной зоной из минимум 2 букв (например, .com, .ru)";
  }

  // Убираем доменную зону и проверяем остальную часть
  const domainWithoutZone = domainPart.slice(
    0,
    domainPart.length - domainZoneMatch[0].length,
  );

  if (domainWithoutZone.length === 0) {
    return "Доменная часть должна содержать имя домена перед доменной зоной";
  }

  return "Неверный формат Email адреса";
};

export const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

export const isPasswordValid = (password: string) => {
  if (password.length < 8) {
    return [false, "Слишком короткий пароль"];
  }
  if (/[а-я]/i.test(password)) {
    return [false, "Не должен содержать кириллицу"];
  }
  if (/\W/.test(password)) {
    return [
      false,
      "Не должен содержать спецсимволы (!@#$%^&*()+-={}[]|;:'\",<>.?/ и т.д.)",
    ];
  }
  if (!/[A-Z]/.test(password)) {
    return [false, "Должна быть хотя бы одна заглавная буква"];
  }
  if (!/(?=.*\d.*\d)/.test(password)) {
    return [false, "Хотя бы две цифры"];
  }
  return [true];
};

type StatusCode = 401 | 403 | 404 | 500;

export const createMockAxiosError = (
  status: StatusCode,
  message = "Mock error",
) => {
  const getStatusText = (status: StatusCode) => {
    const statusTexts = {
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not Found",
      500: "Internal Server Error",
    };
    return statusTexts[status] || "Unknown Error";
  };

  return {
    response: {
      status,
      statusText: getStatusText(status),
      data: { message },
    },
    isAxiosError: true,
    message: `Request failed with status code ${status}`,
  };
};

export function validatePickupTime(
  value: string | undefined,
): string | undefined {
  if (!value) {
    return "Пожалуйста, укажите время";
  }

  const match = value.match(/с\s*(\d{2}):(\d{2})\s*до\s*(\d{2}):(\d{2})/);

  if (!match) {
    return "Заполните до конца";
  }

  const [, startHour, startMinute, endHour, endMinute] = match;

  const startHourNum = parseInt(startHour);
  const startMinuteNum = parseInt(startMinute);
  const endHourNum = parseInt(endHour);
  const endMinuteNum = parseInt(endMinute);

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

/**
 * Checks if a value is "filled" (has meaningful content)
 */
export function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return !Number.isNaN(value);
  if (typeof value === "boolean") return true; // booleans are always "filled"
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return false;
}

const scrollInto = (node: HTMLElement, { top = 0 }: { top?: number } = {}) => {
  const headerHeightStr = getComputedStyle(document.documentElement)
    .getPropertyValue("--header-height")
    .trim();
  let headerHeightPx;
  if (headerHeightStr.endsWith("rem")) {
    const remValue = parseFloat(headerHeightStr);
    const rootFontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    headerHeightPx = remValue * rootFontSize;
  } else {
    headerHeightPx = parseFloat(headerHeightStr);
  }
  const buttonTop = node.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({
    top: buttonTop - headerHeightPx - 30 - top,
    behavior: "smooth",
  });
};

const handleRadioGroupFocus = (button: HTMLButtonElement) => {
  const radioGroup = button.parentElement as HTMLDivElement | null;
  if (!radioGroup || radioGroup.getAttribute("role") !== "radiogroup")
    return null;

  const formItem = radioGroup.parentElement as HTMLDivElement | null;
  if (!formItem || formItem.getAttribute("data-slot") !== "form-item")
    return null;

  const formContainer = formItem.parentElement as HTMLDivElement;
  if (!formContainer) return null;

  const input = formContainer.querySelector(
    `input[data-slot]`,
  ) as HTMLInputElement | null;
  if (input) {
    input.focus();
    return;
  }

  const combobox = formContainer.querySelector(
    'button[role="combobox"]',
  ) as HTMLButtonElement | null;
  if (combobox) {
    combobox.click();
  }
};

const nodeHandlers = {
  BUTTON: (node: HTMLElement) => {
    const button = node as HTMLButtonElement;
    button.click();
    scrollInto(button);

    if (button.hasAttribute("data-radix-collection-item")) {
      setTimeout(() => handleRadioGroupFocus(button), 0);
    }
  },
  INPUT: (node: HTMLElement) => {
    const input = node as HTMLInputElement;
    input.focus();
  },
};

export const defaultOnSubmitInvalid = () => {
  const invalidNode = document.querySelector(`[aria-invalid="true"]`) as
    | HTMLElement
    | null
    | undefined;
  if (!invalidNode) return;

  const handler =
    nodeHandlers[invalidNode.nodeName as keyof typeof nodeHandlers];
  handler?.(invalidNode);
};
