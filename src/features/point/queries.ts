import { workplacePostApi } from "@/axios";
import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import type { DeliveryPoint } from "@/features/point/types";

// Query Keys
const point = createQueryKeys("point", {
  post: {
    queryKey: null,
    contextQueries: {
      combobox: {
        queryKey: null,
      },
    },
  },
});

async function fetchPointsPostData() {
  let { data: points } =
    await workplacePostApi.get<DeliveryPoint[]>("/point/post");

  return points.map((point) => ({
    ...point,
    fullName: [point.name?.trim(), point.address?.trim()]
      .filter(Boolean)
      .join(", "),
  }));
}

// Query Functions
async function pointsPostForCombobox() {
  const points = await fetchPointsPostData();

  const mobilePoints = points.filter((point) => point.mobilePoint);
  const staticPoints = points.filter((point) => !point.mobilePoint);

  const mobile = mobilePoints.map(({ id, fullName }) => ({
    value: id,
    label: fullName,
  }));
  const stationary = staticPoints.map(({ id, fullName }) => ({
    value: id,
    label: fullName,
  }));

  return {
    "Стационарные отделения": stationary,
    "Мобильные отделения": mobile,
  };
}

const usePointPostQuery = () =>
  useQuery({
    queryKey: point.post._ctx.combobox.queryKey,
    queryFn: pointsPostForCombobox,

    // Prevents unnecessary background refetches by keeping server data fresh
    // indefinitely
    // (see: https://tkdodo.eu/blog/practical-react-query#keep-server-and-client-state-separate)
    staleTime: Infinity,
  });

export { usePointPostQuery, point };
