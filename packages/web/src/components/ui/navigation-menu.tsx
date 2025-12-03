import { cn } from "@/lib/utils";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import type { ComponentProps, FC } from "react";

const NavigationMenu: FC<
  ComponentProps<typeof NavigationMenuPrimitive.Root>
> = ({ className, ...props }) => {
  return (
    <NavigationMenuPrimitive.Root
      className={cn("relative z-[1] flex w-full justify-center", className)}
      data-slot="navigation-menu"
      {...props}
    />
  );
};

const NavigationMenuList: FC<
  ComponentProps<typeof NavigationMenuPrimitive.List>
> = ({ className, ...props }) => {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "bg-accentA-3 m-0 flex flex-1 list-none items-center justify-center gap-0.5 rounded-2xl p-1",
        // "[&>li:first-of-type_button]:rounded-s-full [&>li:last-of-type_button]:rounded-e-full",
        className,
      )}
      {...props}
    />
  );
};

const NavigationMenuTrigger: FC<
  ComponentProps<typeof NavigationMenuPrimitive.Trigger>
> = ({ className, ...props }) => {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(
        "flex flex-1 items-center justify-center gap-[2px] rounded-2xl",
        "focus-visible:outline-accent-8 relative overflow-hidden px-2.5 py-2.5 text-ellipsis whitespace-nowrap select-none focus-visible:outline-[2px] focus-visible:-outline-offset-1",
        "text-accent-11 text-sm leading-none",
        "[&_svg]:size-5 [&_svg]:duration-50 [&[data-state='open']>svg]:scale-110 [&[data-state='open']>svg]:rotate-15",
        "[&[data-state='open']]:bg-accentA-2",
        className,
      )}
      {...props}
    />
  );
};

const NavigationMenuContent: FC<
  ComponentProps<typeof NavigationMenuPrimitive.Content>
> = ({ className, ...props }) => {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "bg-panel-translucent absolute top-0 left-0 h-[80dvh] max-h-fit w-auto overflow-y-auto",
        "data-[motion=from-start]:animate-enter-from-left",
        "data-[motion=from-end]:animate-enter-from-right",
        "data-[motion=to-start]:animate-exit-to-left",
        "data-[motion=to-end]:animate-exit-to-right",
        className,
      )}
      {...props}
    />
  );
};

const NavigationMenuViewport: FC<
  ComponentProps<typeof NavigationMenuPrimitive.Viewport>
> = ({ className, ...props }) => {
  return (
    <div className="absolute top-full left-0 flex w-full justify-center perspective-[2000px]">
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "bg-background relative mt-0 origin-[top_center] overflow-hidden rounded-md",
          "shadow-5 h-[var(--radix-navigation-menu-viewport-height)] w-full min-w-[var(--radix-navigation-menu-viewport-width)]",
          "[transition:width,height,50ms_ease]",
          "data-[state=closed]:animate-scale-out",
          className,
        )}
        {...props}
      />
    </div>
  );
};

const NavigationMenuItem: FC<
  ComponentProps<typeof NavigationMenuPrimitive.Item>
> = (props) => {
  return (
    <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" {...props} />
  );
};

const NavigationMenuLink: FC<
  ComponentProps<typeof NavigationMenuPrimitive.Link>
> = ({ className, ...props }) => {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "focus-visible:outline-accent-8 block leading-none no-underline select-none focus-visible:outline-[2px] focus-visible:-outline-offset-1",
        "rounded-sm px-3 py-2",
        "data-[status=active]:text-accent-11 text-gray-12 hover:bg-accentA-2 active:text-accent-11 active:bg-accentA-3",
        "data-[status=active]:bg-accentA-3",
        className,
      )}
      {...props}
    />
  );
};

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuItem,
  NavigationMenuViewport,
};
