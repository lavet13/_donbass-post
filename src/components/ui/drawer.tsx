import { cn } from "@/lib/utils";
import type { ComponentProps, FC } from "react";
import { Drawer as DrawerPrimitive } from "vaul";

const Drawer: FC<ComponentProps<typeof DrawerPrimitive.Root>> = (props) => {
  return (
    <DrawerPrimitive.Root
      repositionInputs={false}
      data-slot="drawer"
      {...props}
    />
  );
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
      <DrawerPrimitive.Overlay className="bg-blackA-6 fixed inset-0" />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        data-is-root-theme="true"
        data-accent-color="red"
        data-gray-color="gray"
        data-has-background="true"
        data-panel-background="translucent"
        data-radius="medium"
        data-scaling="100%"
        className={cn(
          "radix-themes",
          "text-gray-12 bg-gray-2 border-grayA-6 border",
          "group/drawer-content fixed z-50 flex h-auto min-h-0 flex-col outline-none",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80dvh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80dvh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
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
        "data-[vaul-handle]:bg-grayA-6! mx-auto mt-4 mb-1 hidden h-2 w-[100px] shrink-0 cursor-grab rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block active:cursor-grabbing sm:mb-0",
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
      className={cn("mt-8 font-medium", className)}
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
      className={cn("text-grayA-11 mt-2 leading-6", className)}
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
