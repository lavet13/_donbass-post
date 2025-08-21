import { cn } from "@/lib/utils";
import type { ComponentProps, FC } from "react";
import { Drawer as DrawerPrimitive } from "vaul";

const Drawer: FC<ComponentProps<typeof DrawerPrimitive.Root>> = (props) => {
  return <DrawerPrimitive.Root {...props} />;
};

const DrawerTrigger: FC<ComponentProps<typeof DrawerPrimitive.Trigger>> = ({
  className,
  ...props
}) => {
  return <DrawerPrimitive.Trigger className={cn("", className)} {...props} />;
};

const DrawerContent: FC<ComponentProps<typeof DrawerPrimitive.Content>> = ({
  className,
  ...props
}) => {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Overlay className="fixed inset-0 z-10 bg-modal-backdrop" />
      <DrawerPrimitive.Content
        className={cn(
          "group/drawer-content flex flex-col mx-auto bg-modal text-modal-foreground fixed outline-none inset-0 z-10",
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
  return <DrawerPrimitive.Handle className={cn("cursor-grab active:cursor-grabbing data-[vaul-handle]:bg-modal-foreground/20! dark:data-[vaul-handle]:bg-modal-foreground! mx-auto mt-4 hidden h-2 w-[100px] mb-1 sm:mb-0 shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block", className)} {...props} />;
};

const DrawerTitle: FC<ComponentProps<typeof DrawerPrimitive.Title>> = ({
  className,
  ...props
}) => {
  return (
    <DrawerPrimitive.Title
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
