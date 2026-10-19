import { createFileRoute } from '@tanstack/react-router'
import { pageHead } from "@/lib/seo";
import { OnlinePickupRFPage } from './-shared'

export const Route = createFileRoute('/_public/online-pickup-rf/')({
  head: () =>
    pageHead({
      title: "Заявка на забор груза по России",
      description: "Онлайн-заявка на забор груза по России с доставкой в ЛДНР.",
    }),
  component: RouteComponent,
})

function RouteComponent() {
  return <OnlinePickupRFPage />
}
