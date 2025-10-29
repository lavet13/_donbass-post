import { HighlightText } from "@/components/typography/highlight-text";
import { TrackingPage } from "@/routes/_public/tracking/-shared";
import { Flex, Text, Strong, Separator, Heading } from "@radix-ui/themes";
import { createFileRoute } from "@tanstack/react-router";

type TrackingSearch = {
  q?: string;
};

export const Route = createFileRoute("/_public/tracking/")({
  component: TrackingComponent,
  validateSearch(search): TrackingSearch {
    return {
      q: (search.q as string) || undefined,
    };
  },
});

function TrackingComponent() {
  return (
    <div className="mx-auto w-full mx-auto max-w-2xl">
      <div className="xs:h-2 h-4 shrink-0" />
      <Heading className="sm:mb-8 sm:mt-4" size="8" align="center" mb="3">
        <HighlightText>Отслеживание</HighlightText>
      </Heading>
      <Flex direction="column">
        <Text wrap="balance" as="p" size="3" mb="1">
          Обновление данных происходит <Strong>Пн-Сб</Strong> с 17<sup>00</sup>{" "}
          до 18<sup>00</sup> по МСК.
        </Text>
        <TrackingPage />
        <Separator ml="4" my="2" size="2" />
      </Flex>
    </div>
  );
}
