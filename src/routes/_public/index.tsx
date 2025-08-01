import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/')({
  component: IndexComponent,
})

function IndexComponent() {
  return <div>Hello client</div>
}
