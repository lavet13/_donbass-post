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
      size="7"
      className={cn(
        "leading-rx-6 md:leading-rx-5 mb-1 sm:mb-0 tracking-tight",
        className,
      )}
      {...props}
    />
  );
};
