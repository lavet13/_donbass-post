import { workplacePostApi } from "@/axios";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import {
  queryOptions,
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { AdditionalServicePickUp } from "@/features/additional-service/types";
// import { createMockAxiosError } from "@/lib/utils";

const additionalServiceKeys = createQueryKeys("additional-service", {
  "pick-up": {
    queryKey: null,
  },
});

const fetchAdditionalServicePickUp = async () => {
  // throw createMockAxiosError('501', "Internal Server Error");
  const response = await workplacePostApi.get<AdditionalServicePickUp[]>(
    "additional-service/pick-up",
  );
  return response.data
    .filter(({ active }) => active)
    .map(({ id, name, price }) => ({ label: name, value: id, price }));
};

type UseAdditionalServicePickUpQueryProps = {
  options?: UseQueryOptions;
};

const additionalServicePickUpQueryOptions = queryOptions({
  queryKey: additionalServiceKeys["pick-up"].queryKey,
  queryFn: fetchAdditionalServicePickUp,
});

const useAdditionalServicePickUpQuery = (
  props: UseAdditionalServicePickUpQueryProps = {},
) => {
  const { options = {} } = props;

  return useQuery({
    ...additionalServicePickUpQueryOptions,
    ...options,
  });
};

export {
  additionalServiceKeys,
  useAdditionalServicePickUpQuery,
  additionalServicePickUpQueryOptions,
};
