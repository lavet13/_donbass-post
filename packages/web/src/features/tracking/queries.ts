import { workplacePostApi } from "@/axios";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import type { TrackingRostovKeys, TrackingRostovResult } from "./types";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

const trackingRostovKeys = createQueryKeys("tracking", {
  rostovTracking: (trackingNumber?: string) => ({
    queryKey: [trackingNumber],
    queryFn: () => fetchTrackingRostov(trackingNumber),
  }),
});

const fetchTrackingRostov = async (trackingNumber?: string) => {
  try {
    const response = await workplacePostApi.get<TrackingRostovResult>(
      "/tracking",
      {
        params: {
          npTrack: trackingNumber,
        },
      },
    );

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
      throw new Error("Произошла непредвиденная ошибка. Попробуйте еще раз.");
    }
  }
};

type UseTrackingQueryProps = {
  trackingNumber?: string;
  options?: Omit<
    UseQueryOptions<
      TrackingRostovResult,
      AxiosError<{ message: string }>,
      TrackingRostovResult,
      TrackingRostovKeys["rostovTracking"]["queryKey"]
    >,
    "queryKey"
  >;
};

const useTrackingRostovQuery = (props: UseTrackingQueryProps = {}) => {
  const { options = {}, trackingNumber } = props;

  return useQuery({
    ...trackingRostovKeys.rostovTracking(trackingNumber),
    retry: 0,
    ...options,
  });
};

export { trackingRostovKeys, useTrackingRostovQuery };
