import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard/requests/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Заявки
    </div>
  );
}
