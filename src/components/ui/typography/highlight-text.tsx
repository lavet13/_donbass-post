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
          "selection:bg-primary-foreground selection:text-primary relative inline-block before:absolute before:-top-[1px] before:-bottom-1.5 mx-2 sm:mx-0 before:-inset-x-1 before:block before:rounded-sm before:-skew-y-2 before:-skew-x-10 before:bg-primary before:-z-1",
          outerStyles,
        )}
      >
        <span
          className={cn(
            "relative leading-none text-primary-foreground",
            innerStyles,
          )}
        >
          {children}
        </span>
      </span>
    </span>
  );
};
