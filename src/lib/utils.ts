import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

// radix-ui primitive(link: https://github.com/radix-ui/primitives/blob/main/packages/core/primitive/src/primitive.tsx#L11)
export function composeEventHandlers<E extends { defaultPrevented: boolean }>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {},
) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event);

    if (checkForDefaultPrevented === false || !event.defaultPrevented) {
      return ourEventHandler?.(event);
    }
  };
}
