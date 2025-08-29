import { workplacePostApi } from "@/axios";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { DeliveryCompany } from "@/features/delivery-company/types";

const deliveryCompanyKeys = createQueryKeys("delivery-company");

const fetchDeliveryCompanies = async () => {
  const response =
    await workplacePostApi.get<DeliveryCompany[]>("/delivery-company");

  return [
    {
      label: "Транспортные компании",
      items: response.data.map(({ id, name }) => ({ label: name, value: id })),
    },
  ];
};

type UseDeliveryCompaniesQueryProps = {
  options?: UseQueryOptions;
};

const useDeliveryCompaniesQuery = (
  props: UseDeliveryCompaniesQueryProps = {},
) => {
  const { options = {} } = props;

  return useQuery({
    queryKey: deliveryCompanyKeys._def,
    queryFn: fetchDeliveryCompanies,
    ...options,
  });
};

export { useDeliveryCompaniesQuery, deliveryCompanyKeys };
