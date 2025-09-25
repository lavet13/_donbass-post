import { Text } from '@radix-ui/themes'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/')({
  component: IndexComponent,
})

function IndexComponent() {
  return <Text>Hello client</Text>
}
