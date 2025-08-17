import { cn } from "@/lib/utils";
import type { ComponentProps, FC } from "react";

export const TypographyH3: FC<ComponentProps<"h3">> = ({
  className,
  ...props
}) => {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-2xl leading-none mb-1 sm:mb-0 sm:leading-8 font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
};
