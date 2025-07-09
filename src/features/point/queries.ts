import { workplacePostApi } from "@/axios";
import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import type { DeliveryPoint } from "@/features/point/types";

// Query Keys
const point = createQueryKeys("point", {
  post: {
    queryKey: null,
  },
});

// Query Functions
async function fetchPointPost() {
  let { data: points } =
    await workplacePostApi.get<DeliveryPoint[]>("/point/post");

  points = points.map((point) => ({
    ...point,
    fullName: [point.name?.trim(), point.address?.trim()]
      .filter(Boolean)
      .join(", "),
  }));

  const mobilePoints = points.filter((point) => point.mobilePoint);
  const staticPoints = points.filter((point) => !point.mobilePoint);

  return { mobilePoints, staticPoints };
}

const usePointPostQuery = () =>
  useQuery({
    queryKey: point.post.queryKey,
    queryFn: fetchPointPost,

    // Prevents unnecessary background refetches by keeping server data fresh
    // indefinitely
    // (see: https://tkdodo.eu/blog/practical-react-query#keep-server-and-client-state-separate)
    staleTime: Infinity,
  });

export { usePointPostQuery, point };
