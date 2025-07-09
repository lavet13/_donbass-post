import { useAdditionalServicePickUpQuery } from "@/features/additional-service/queries";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  const { data } = useAdditionalServicePickUpQuery();
  console.log({ data });

  return (
    <div className="flex-1 flex items-center justify-center">
      Wassup
    </div>
  );
}
