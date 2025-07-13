import { workplacePostApi } from "@/axios";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useQuery } from "@tanstack/react-query";
import type { DeliveryCompany } from "@/features/delivery-company/types";

// Query Keys
const deliveryCompany = createQueryKeys("delivery-company");

// Query functions
const fetchDeliveryCompanies = async () => {
  const response = await workplacePostApi.get<DeliveryCompany[]>("/delivery-company");
  return response.data;
}

const useDeliveryCompaniesQuery = () =>
  useQuery({
    queryKey: deliveryCompany._def,
    queryFn: fetchDeliveryCompanies,

    // Prevents unnecessary background refetches by keeping server data fresh
    // indefinitely
    // (see: https://tkdodo.eu/blog/practical-react-query#keep-server-and-client-state-separate)
    staleTime: Infinity,
  });

export { useDeliveryCompaniesQuery, deliveryCompany };
