import { createFileRoute } from '@tanstack/react-router'
import { OnlinePickupRFPage } from './-shared'

export const Route = createFileRoute('/_public/online-pickup-rf/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <OnlinePickupRFPage />
}
