import { workplacePostApi } from "@/axios";
import {
  createQueryKeys,
  type inferQueryKeys,
} from "@lukemorales/query-key-factory";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { CargoTrackingResult } from "./types";

const cargoTrackingKeys = createQueryKeys("cargo-tracking", {
  tracking: (trackingNumber?: string) => ({
    queryKey: [trackingNumber],
    queryFn: () => fetchCargoTracking(trackingNumber),
  }),
});

export type CargoTrackingKeys = inferQueryKeys<typeof cargoTrackingKeys>;

const fetchCargoTracking = async (trackingNumber?: string) => {
  try {
    const response = await workplacePostApi.get<CargoTrackingResult>(
      `cargo-tracking/search/${encodeURIComponent(trackingNumber ?? "")}`,
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

type UseCargoTrackingQueryProps = {
  trackingNumber?: string;
  options?: Omit<
    UseQueryOptions<
      CargoTrackingResult,
      AxiosError<{ message: string }>,
      CargoTrackingResult,
      CargoTrackingKeys["tracking"]["queryKey"]
    >,
    "queryKey"
  >;
};

const useCargoTrackingQuery = (props: UseCargoTrackingQueryProps = {}) => {
  const { options = {}, trackingNumber } = props;

  return useQuery({
    ...cargoTrackingKeys.tracking(trackingNumber),
    retry: 0,
    ...options,
  });
};

export { useCargoTrackingQuery, cargoTrackingKeys, fetchCargoTracking };
