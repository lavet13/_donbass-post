import { cn } from "@/lib/utils";
import type { ComponentProps, FC } from "react";

export const HighlightText: FC<
  ComponentProps<"span"> & {
    containerStyles?: string;
    innerStyles?: string;
    outerStyles?: string;
  }
> = ({ innerStyles, outerStyles, containerStyles, children }) => {
  return (
    <span className={containerStyles}>
      <span
        className={cn(
          "relative inline-block before:absolute before:-top-[1px] before:-bottom-1.5 mx-2 sm:mx-0 before:-inset-x-1 before:block before:rounded-lg before:-skew-y-0.5 before:-skew-x-4 before:bg-accent-9",
          outerStyles,
        )}
      >
        <span
          className={cn(
            "relative leading-none text-accent-contrast selection:bg-accent-5",
            innerStyles,
          )}
        >
          {children}
        </span>
      </span>
    </span>
  );
};
