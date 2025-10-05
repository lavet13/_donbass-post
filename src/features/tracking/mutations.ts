import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { TrackingRostovParams, TrackingRostovResult } from "./types";
import type { AxiosError } from "axios";
import { workplacePostApi } from "@/axios";

type UseTrackingRostovProps = {
  options?: UseMutationOptions<
    TrackingRostovResult,
    Error,
    TrackingRostovParams
  >;
};

const useTrackingRostov = (props: UseTrackingRostovProps = {}) => {
  const { options = {} } = props;

  return useMutation({
    async mutationFn(variables) {
      try {
        const response = await workplacePostApi.get("/tracking", {
          params: {
            npTrack: variables.trackingNumber,
          },
        });

        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;

        if (axiosError.response) {
          if (axiosError.response.status === 500) {
            throw new Error(
              "Сервер временно недоступен. Пожалуйста, попробуйте позже.",
            );
          }
          if (axiosError.response.status === 400) {
            throw new Error("Проверьте правильность введенного ТТН №/Трека");
          }
          throw new Error(
            `Запрос завершился с ошибкой ${axiosError.response.status}`,
          );
        } else if (axiosError.request) {
          throw new Error(
            "Нет ответа от сервера. Пожалуйста, проверьте подключение к интернету.",
          );
        } else {
          throw new Error(
            "Произошла непредвиденная ошибка. Попробуйте еще раз.",
          );
        }
      }
    },
    ...options,
  });
};

export { useTrackingRostov };
