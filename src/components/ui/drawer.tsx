import { cn } from "@/lib/utils";
import type { ComponentProps, FC } from "react";
import { Drawer as DrawerPrimitive } from "vaul";

const Drawer: FC<ComponentProps<typeof DrawerPrimitive.Root>> = (props) => {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
};

const DrawerTrigger: FC<ComponentProps<typeof DrawerPrimitive.Trigger>> = ({
  className,
  ...props
}) => {
  return (
    <DrawerPrimitive.Trigger
      data-slot="drawer-trigger"
      className={cn("", className)}
      {...props}
    />
  );
};

const DrawerContent: FC<ComponentProps<typeof DrawerPrimitive.Content>> = ({
  className,
  ...props
}) => {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Overlay className="fixed inset-0 bg-modal-backdrop z-50" />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content flex text-modal-foreground fixed outline-none z-50",

          // removing blur
          "transform-gpu backface-hidden will-change-auto",
          "[font-smoothing:subpixel-antialiased] [text-rendering:optimizeLegibility]",
          "[-webkit-font-smoothing:subpixel-antialiased]",
          className,
        )}
        {...props}
      />
    </DrawerPrimitive.Portal>
  );
};

const DrawerHandle: FC<ComponentProps<typeof DrawerPrimitive.Handle>> = ({
  className,
  ...props
}) => {
  return (
    <DrawerPrimitive.Handle
      data-slot="drawer-handle"
      className={cn(
        "cursor-grab active:cursor-grabbing data-[vaul-handle]:bg-modal-foreground/20! dark:data-[vaul-handle]:bg-modal-foreground! mx-auto mt-4 hidden h-2 w-[100px] mb-1 sm:mb-0 shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block lg:data-[vaul-handle]:hidden!",
        className,
      )}
      {...props}
    />
  );
};

const DrawerTitle: FC<ComponentProps<typeof DrawerPrimitive.Title>> = ({
  className,
  ...props
}) => {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("font-medium mt-8", className)}
      {...props}
    />
  );
};

const DrawerDescription: FC<
  ComponentProps<typeof DrawerPrimitive.Description>
> = ({ className, ...props }) => {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("leading-6 mt-2 text-muted-foreground", className)}
      {...props}
    />
  );
};

export {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHandle,
  DrawerTitle,
  DrawerDescription,
};
