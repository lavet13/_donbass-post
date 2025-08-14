import { workplacePostApi } from "@/axios";
import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import type { DeliveryPoint } from "@/features/point/types";

// Query Keys
const pointKeys = createQueryKeys("point", {
  post: {
    queryKey: null,
  },
});

async function fetchAllPointsPost() {
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
async function pointsPost() {
  const points = await fetchAllPointsPost();

  const mobilePoints = points.filter((point) => point.mobilePoint);
  const staticPoints = points.filter((point) => !point.mobilePoint);

  const mobile = mobilePoints.map(({ id, fullName, name, address }) => ({
    value: id,
    label: fullName,
    name,
    address,
  }));
  const stationary = staticPoints.map(({ id, fullName, name, address }) => ({
    value: id,
    label: fullName,
    name,
    address,
  }));

  return [
    {
      label: "Стационарные отделения",
      items: stationary,
    },
    {
      label: "Мобильные отделения",
      items: mobile,
    },
  ];
}

const usePointPostQuery = () =>
  useQuery({
    queryKey: pointKeys.post.queryKey,
    queryFn: pointsPost,

    // Prevents unnecessary background refetches by keeping server data fresh
    // indefinitely
    // (see: https://tkdodo.eu/blog/practical-react-query#keep-server-and-client-state-separate)
    staleTime: Infinity,
    retry: false,
  });

export { usePointPostQuery, pointKeys };
