import { cn } from "@/lib/utils";
import type { ComponentProps, FC } from "react";

export const TypographyH4: FC<ComponentProps<"h3">> = ({
  className,
  ...props
}) => {
  return (
    <h4
      className={cn(
        "scroll-m-20 text-lg sm:text-xl leading-none mb-1 sm:mb-0 sm:leading-8 font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
};

