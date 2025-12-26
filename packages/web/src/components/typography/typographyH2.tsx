import { cn } from "@/lib/utils";
import { Heading } from "@radix-ui/themes";
import type { ComponentProps, FC } from "react";

export const TypographyH2: FC<ComponentProps<typeof Heading>> = ({
  className,
  ...props
}) => {
  return (
    <Heading
      wrap="pretty"
      as="h2"
      className={cn(
        "text-left xs:text-center mb-1 tracking-tight sm:mb-0",
        "xs:px-4 px-2 pb-2 sm:px-0 text-7 md:text-8 leading-8.5",
        className,
      )}
      {...props}
    />
  );
};
