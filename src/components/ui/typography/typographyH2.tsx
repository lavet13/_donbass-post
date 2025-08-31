import { cn } from "@/lib/utils";
import type { ComponentProps, FC } from "react";

export const TypographyH2: FC<ComponentProps<"h2">> = ({
  className,
  ...props
}) => {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-3xl leading-8 mb-1 sm:mb-0 font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
};
