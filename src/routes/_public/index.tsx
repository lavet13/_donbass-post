import { Text } from "@radix-ui/themes";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/")({
  component: IndexComponent,
});

function IndexComponent() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <Text>Hello client</Text>
    </div>
  );
}
