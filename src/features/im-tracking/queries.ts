import { workplacePostApi } from "@/axios";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { IMTrackingResult } from "./types";

const InternetMagazineTrackingKeys = createQueryKeys("im-tracking", {
  promo: (promocode: string) => ({
    queryKey: [promocode],
    queryFn: () => fetchInternetMagazinePromo(promocode),
  }),
});

const fetchInternetMagazinePromo = async (promo: string) => {
  try {
    const response = await workplacePostApi.get<IMTrackingResult>(
      "/im-tracking",
      {
        params: {
          promo,
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

const useInternetMagazinePromo = (promocode: string) => {
  return useQuery(InternetMagazineTrackingKeys.promo(promocode));
};

export {
  InternetMagazineTrackingKeys,
  fetchInternetMagazinePromo,
  useInternetMagazinePromo,
};
