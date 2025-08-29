import * as ResizablePrimitive from "react-resizable-panels";
import { cn } from "@/lib/utils";
import type { ComponentProps, FC } from "react";

const ResizablePanelGroup: FC<
  ComponentProps<typeof ResizablePrimitive.PanelGroup>
> = ({ className, ...props }) => {
  return (
    <ResizablePrimitive.PanelGroup
      className={cn(
        "bg-sidebar flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
};

const ResizablePanel: FC<ComponentProps<typeof ResizablePrimitive.Panel>> = ({
  ...props
}) => {
  return <ResizablePrimitive.Panel {...props} />;
};

const ResizableHandle: FC<
  ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
    withHandle?: boolean;
  }
> = ({ className, withHandle, ...props }) => {
  return (
    <ResizablePrimitive.PanelResizeHandle
      className={cn(
        "focus-visible:ring-ring focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden duration-100 ease-linear transition-colors",
        "relative w-0.5 bg-sidebar-border hover:bg-primary/80 data-[resize-handle-active]:bg-primary outline-none pointer-coarse:w-1",
        "data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:h-0.5 data-[panel-group-direction=vertical]:pointer-coarse:h-1",

        withHandle && [
          "after:content-['']",
          "after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2",
          "after:h-8 after:w-2 after:bg-sidebar-border after:rounded",
          "after:transition-colors after:duration-100 after:ease-linear",
          "hover:after:bg-primary",
          "data-[resize-handle-active]:after:opacity-100 data-[resize-handle-active]:after:bg-primary",
          "after:pointer-coarse:w-2 after:pl-2",
        ],
        className,
      )}
      {...props}
    />
  );
};

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
