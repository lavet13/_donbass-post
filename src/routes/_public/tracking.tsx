import CargoTrackingPage from "@/features/cargo-tracking/page";
import { Flex, Text, Strong, Separator } from "@radix-ui/themes";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/tracking")({
  component: TrackingComponent,
});

function TrackingComponent() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="h-4 xs:h-2 shrink-0" />
      <Flex direction="column">
        <Text truncate wrap="balance" as="p" size="3" mb="1">
          Обновление данных происходит <Strong>Пн-Сб</Strong> с 17<sup>00</sup>{" "}
          до 18<sup>00</sup> по МСК.
        </Text>
        <CargoTrackingPage />
        <Separator my="2" size="4" />
      </Flex>
      <div className="min-h-screen" />
    </div>
  );
}
