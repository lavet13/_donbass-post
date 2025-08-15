import { cn } from "@/lib/utils";
import type { ComponentProps, FC } from "react";

export const TypographyH3: FC<ComponentProps<"h3">> = ({
  className,
  ...props
}) => {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
};
