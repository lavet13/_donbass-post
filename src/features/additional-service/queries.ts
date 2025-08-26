import { workplacePostApi } from "@/axios";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useQuery } from "@tanstack/react-query";
import type { AdditionalServicePickUp } from "@/features/additional-service/types";

const additionalServiceKeys = createQueryKeys("additional-service", {
  "pick-up": {
    queryKey: null,
  },
});

const fetchAdditionalServicePickUp = async () => {
  const response = await workplacePostApi.get<AdditionalServicePickUp[]>(
    "additional-service/pick-up",
  );
  return response.data
    .filter(({ active }) => active)
    .map(({ id, name, price }) => ({ label: name, value: id, price }));
};

const useAdditionalServicePickUpQuery = () =>
  useQuery({
    queryKey: additionalServiceKeys["pick-up"].queryKey,
    queryFn: fetchAdditionalServicePickUp,

    retry: false,
  });

export { additionalServiceKeys, useAdditionalServicePickUpQuery };
