import * as ResizablePrimitive from "react-resizable-panels";
import { cn } from "@/lib/utils";
import type { ComponentProps, FC } from "react";

const ResizablePanelGroup: FC<
  ComponentProps<typeof ResizablePrimitive.PanelGroup>
> = ({ className, ...props }) => {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
};

const ResizablePanel: FC<ComponentProps<typeof ResizablePrimitive.Panel>> = ({
  className,
  ...props
}) => {
  return (
    <ResizablePrimitive.Panel
      data-slot="resizable-panel"
      className={cn("relative overflow-hidden", className)}
      {...props}
    />
  );
};

const ResizableHandle: FC<
  ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
    withHandle?: boolean;
  }
> = ({ className, withHandle, ...props }) => {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "focus-visible:ring-ring focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden duration-100 ease-linear transition-colors",
        "relative w-0.5 bg-grayA-5 hover:bg-accentA-9 data-[resize-handle-active]:bg-accentA-9 outline-none pointer-coarse:w-1",
        "data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:h-0.5 data-[panel-group-direction=vertical]:pointer-coarse:h-1",

        withHandle && [
          "after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2",
          "after:h-8 after:w-2 after:bg-grayA-5 after:rounded",
          "after:transition-colors after:duration-100 after:ease-linear",
          "hover:after:bg-accentA-9",
          "data-[resize-handle-active]:after:bg-accentA-9",
          "after:pointer-coarse:w-3 after:pointer-coarse:h-9 after:pl-2",
        ],
        className,
      )}
      {...props}
    />
  );
};

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
