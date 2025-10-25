import { cn } from "@/lib/utils";
import { Heading } from "@radix-ui/themes";
import type { ComponentProps, FC } from "react";

export const TypographyH2: FC<ComponentProps<typeof Heading>> = ({
  className,
  ...props
}) => {
  return (
    <Heading
      wrap="balance"
      as="h2"
      size="8"
      className={cn(
        "leading-rx-7.5 md:leading-rx-7 mb-1 tracking-tight sm:mb-0",
        "xs:px-4 px-2 pb-2 text-start sm:px-0 sm:text-center",
        className,
      )}
      {...props}
    />
  );
};
