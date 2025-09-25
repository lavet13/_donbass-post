import { cn } from "@/lib/utils";
import { Heading } from "@radix-ui/themes";
import type { ComponentProps, FC } from "react";

export const TypographyH3: FC<ComponentProps<typeof Heading>> = ({
  className,
  ...props
}) => {
  return (
    <Heading
      as="h3"
      size="6"
      className={cn(
        "leading-rx-5 sm:leading-rx-6 mb-1 sm:mb-0 tracking-tight",
        className,
      )}
      {...props}
    />
  );
};
