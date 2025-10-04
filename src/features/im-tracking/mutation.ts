import { workplacePostApi } from "@/axios";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type {
  IMTrackingParams,
  IMTrackingResult,
} from "@/features/im-tracking/types";
import type { AxiosError } from "axios";

type UseIMTrackingMutationProps = {
  options?: UseMutationOptions<
    IMTrackingResult,
    AxiosError<{ message: string }>,
    IMTrackingParams
  >;
};

const useIMTrackingMutation = (props: UseIMTrackingMutationProps = {}) => {
  const { options = {} } = props;

  return useMutation({
    async mutationFn(variables) {
      try {
        const response = await workplacePostApi.get("/im-tracking", {
          params: {
            promo: variables.promo,
          },
        });

        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;

        if (axiosError.response) {
          if (axiosError.response.status === 500) {
            return {
              success: false as const,
              error: "Ошибка сервера",
              message:
                "Сервер временно недоступен. Пожалуйста, попробуйте позже.",
            };
          }
          if (axiosError.response.status === 400) {
            return {
              success: false as const,
              error: "Неверный запрос",
              message: "Проверьте правильность введенного ТТН №/Трека",
            };
          }
          return {
            success: false as const,
            error: "Ошибка запроса",
            message: `Запрос завершился с ошибкой ${axiosError.response.status}`,
          };
        } else if (axiosError.request) {
          return {
            success: false as const,
            error: "Нет ответа",
            message:
              "Нет ответа от сервера. Пожалуйста, проверьте подключение к интернету.",
          };
        } else {
          return {
            success: false as const,
            error: "Неизвестная ошибка",
            message: "Произошла непредвиденная ошибка. Попробуйте еще раз.",
          };
        }
      }
    },
    ...options,
  });
};

export { useIMTrackingMutation };
