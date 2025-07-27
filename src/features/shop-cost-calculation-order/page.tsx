import { useAppForm } from "@/hooks/form";
import { defaultShopCostCalculationOrderOpts } from "@/features/shop-cost-calculation-order/shared-form";
import { ShopCostCalculationOrderForm } from "@/features/shop-cost-calculation-order/nested-form";
import { Suspense } from "react";
import { Loader } from "lucide-react";
import { useShopCostCalculationOrderMutation } from "./mutations";
import { isAxiosError } from "axios";
import { transformApiErrorsToFormErrors } from "@/lib/utils";
import { usePointPostQuery } from "@/features/point/queries";

export default function ShopCostCalculationOrderPage() {
  const { mutateAsync: createShopCostCalculationOrder } =
    useShopCostCalculationOrderMutation();
  const { data: values } = usePointPostQuery();

  const form = useAppForm({
    ...defaultShopCostCalculationOrderOpts,
    onSubmit: async ({ value, formApi, meta }) => {
      const shopCostCalculationOrder = {
        ...value.shopCostCalculationOrder,
        pointTo: Number.parseInt(value.shopCostCalculationOrder.pointTo, 10),
      };
      const shopCostCalculationOrderPosition =
        value.shopCostCalculationOrderPosition.flatMap((s) =>
          s.products.map((product) => ({
            shop: s.shop,
            ...product,
          })),
        );
      const payload = {
        shopCostCalculationOrder,
        shopCostCalculationOrderPosition,
      };

      try {
        await createShopCostCalculationOrder(payload);
        formApi.reset();
        const entries = Object.entries(values ?? {});
        const allEntries = entries.flatMap(([, items]) => items);
        const selectedEntry = allEntries.find(
          (entry) => entry.value === payload.shopCostCalculationOrder.pointTo,
        )!;

        meta.onSuccess?.((prev) => ({
          ...prev,
          isOpen: true,
          options: [
            {
              label: "Пункт выдачи:",
              value: `${selectedEntry.name.trim()}, по адресу: ${selectedEntry.address}`,
            },
          ],
          extra: [
            `Мы отправили письмо с заполненными данными на вашу почту: ${payload.shopCostCalculationOrder.email}`,
            `Это письмо сформировано автоматически службой уведомлений сайта компании.`,
            `Отвечать на него не нужно.`,
            <br />,
            <p className="font-bold text-sm">
              В случае не соответствия повторите заказ.
            </p>,
          ],
        }));
      } catch (error) {
        if (isAxiosError(error)) {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx

            const errors = error.response.data.message as Record<
              string,
              string
            >[];
            const status = error.response.status;

            const transformedErrors = transformApiErrorsToFormErrors(errors[0]);

            if (status === 400) {
              formApi.setErrorMap({
                onChange: {
                  fields: transformedErrors,
                },
              });
            }

            if (status >= 500) {
              console.error("Server is out");
            }
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            import.meta.env.DEV && console.log(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            import.meta.env.DEV && console.log("Error", error.message);
          }
        } else {
          import.meta.env.DEV && console.error("Unknown error");
        }
      }
    },
  });

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <Loader className="animate-spin size-5" />
        </div>
      }
    >
      <ShopCostCalculationOrderForm form={form} />
    </Suspense>
  );
}
