import { useShopCostCalculationOrderUserQuery } from '@/features/shop-cost-calculation-order/queries'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard/requests')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isPending } = useShopCostCalculationOrderUserQuery();

  console.log({ data, isPending });

  return <div>Заявки</div>
}
