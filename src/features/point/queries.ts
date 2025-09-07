import { workplacePostApi } from "@/axios";
import {
  queryOptions,
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import type { DeliveryPoint } from "@/features/point/types";

const pointKeys = createQueryKeys("point", {
  post: {
    queryKey: null,
  },
});

async function fetchAllPointsPost() {
  const { data: points } =
    await workplacePostApi.get<DeliveryPoint[]>("/point/post");

  return points.map((point) => ({
    ...point,
    fullName: [point.name?.trim(), point.address?.trim()]
      .filter(Boolean)
      .join(", "),
  }));
}

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

type UsePointPostQueryProps = {
  options?: UseQueryOptions;
};

const pointPostQueryOptions = queryOptions({
  queryKey: pointKeys.post.queryKey,
  queryFn: pointsPost,
});

const usePointPostQuery = (props: UsePointPostQueryProps = {}) => {
  const { options = {} } = props;

  return useQuery({
    ...pointPostQueryOptions,
    ...options,
  });
};

export { usePointPostQuery, pointKeys, pointPostQueryOptions };
