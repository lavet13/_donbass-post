import { cn } from "@/lib/utils";
import type { ComponentProps, FC } from "react";
import { Drawer as DrawerPrimitive } from "vaul";

const Drawer: FC<ComponentProps<typeof DrawerPrimitive.Root>> = (props) => {
  return <DrawerPrimitive.Root repositionInputs={false} data-slot="drawer" {...props} />;
};

const DrawerTrigger: FC<ComponentProps<typeof DrawerPrimitive.Trigger>> = ({
  className,
  ...props
}) => {
  return (
    <DrawerPrimitive.Trigger
      data-slot="drawer-trigger"
      className={cn("radix-themes", className)}
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
          "group/drawer-content text-gray-12 bg-gray-2 fixed flex min-h-0 flex-col outline-none",

          // removing blur
          "transform-gpu will-change-auto backface-hidden",
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
        "data-[vaul-handle]:bg-grayA-6! mx-auto mt-4 mb-1 hidden h-2 w-[100px] shrink-0 cursor-grab rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block active:cursor-grabbing sm:mb-0 lg:data-[vaul-handle]:hidden!",
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
