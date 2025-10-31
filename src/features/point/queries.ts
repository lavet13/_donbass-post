import { workplacePostApi } from "@/axios";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import type {
  DeliveryPoint,
  DeliveryPointSchedule,
} from "@/features/point/types";

const pointKeys = createQueryKeys("point", {
  // Информация об отделениях
  post: {
    queryKey: null,
    queryFn: pointsPost,
  },

  // Расписания отделений
  list: {
    queryKey: null,
    queryFn: fetchListPoints,
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

const usePointPostQuery = (props: UsePointPostQueryProps = {}) => {
  const { options = {} } = props;

  return useQuery({
    ...pointKeys.post,
    ...options,
  });
};

async function fetchListPoints() {
  const { data: points } =
    await workplacePostApi.get<DeliveryPointSchedule[]>("/point/list");

  const mobilePoints = points.filter((point) => point.mobilePoint);
  const staticPoints = points.filter((point) => !point.mobilePoint);

  const mobile = mobilePoints.map(({ id, name, ...otherProps }) => ({
    value: id,
    label: name,
    ...otherProps,
  }));

  const stationary = staticPoints.map(({ id, name, ...otherProps }) => ({
    value: id,
    label: name,
    ...otherProps,
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

type UsePointListQueryProps = {
  options?: UseQueryOptions;
};

const usePointListQuery = (props: UsePointListQueryProps = {}) => {
  const { options = {} } = props;

  return useQuery({
    ...pointKeys.list,
    ...options,
  });
};

export { pointKeys, usePointPostQuery, usePointListQuery };
