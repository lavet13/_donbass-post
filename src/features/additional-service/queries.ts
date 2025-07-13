import { workplacePostApi } from "@/axios";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useQuery } from "@tanstack/react-query";
import type { AdditionalServicePickUp } from "@/features/additional-service/types";

const additionalService = createQueryKeys("additional-service", {
  "pick-up": {
    queryKey: null,
  },
});

const fetchAdditionalServicePickUp = async () => {
  const response = await workplacePostApi.get<AdditionalServicePickUp[]>("additional-service/pick-up");
  return response.data;
}

const useAdditionalServicePickUpQuery = () =>
  useQuery({
    queryKey: additionalService["pick-up"].queryKey,
    queryFn: fetchAdditionalServicePickUp,

    // Prevents unnecessary background refetches by keeping server data fresh
    // indefinitely
    // (see: https://tkdodo.eu/blog/practical-react-query#keep-server-and-client-state-separate)
    staleTime: Infinity,
  });

export { additionalService, useAdditionalServicePickUpQuery };
