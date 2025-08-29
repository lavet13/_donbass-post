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
        "group focus-visible:ring-ring focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden duration-100 ease-linear transition-colors",
        "relative w-0.5 bg-sidebar-border hover:bg-primary/80 data-[resize-handle-active]:bg-primary outline-none pointer-coarse:w-1.5",
        "data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:h-0.5 data-[panel-group-direction=vertical]:pointer-coarse:h-1.5",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="opacity-0 group-hover:opacity-100 group-hover:bg-primary group-data-[resize-handle-active]:opacity-100 group-data-[resize-handle-active]:bg-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-2 pointer-coarse:w-3 flex justify-center items-center bg-sidebar-border rounded" />
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
};

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
