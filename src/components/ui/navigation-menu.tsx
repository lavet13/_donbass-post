import { cn } from "@/lib/utils";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import type { ComponentProps, FC } from "react";

const NavigationMenu: FC<
  ComponentProps<typeof NavigationMenuPrimitive.Root>
> = ({ className, ...props }) => {
  return (
    <NavigationMenuPrimitive.Root
      className={cn(
        "relative flex-1 flex max-w-max items-center justify-center z-1",
        className,
      )}
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
        "flex flex-1 justify-center bg-accentA-2 rounded-full list-none p-1 m-0",
        "[&>li:first-of-type_button]:rounded-s-full [&>li:last-of-type_button]:rounded-e-full",
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
        "w-max",
        "inline-flex items-center justify-center gap-[2px]",
        "py-1.5 px-1.5 whitespace-nowrap overflow-hidden text-ellipsis outline-none select-none",
        "text-sm text-accent-11 bg-accentA-2 hover:bg-accentA-4 leading-none",
        "[&[data-state='open']>svg]:-rotate-180 [&_svg]:size-4 [&_svg]:duration-150",
        "[&[data-state='open']]:bg-accentA-5",
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
        "sm:absolute top-0 left-0 w-full sm:w-auto",
        // "data-[motion=from-start]:animate-enter-from-left",
        // "data-[motion=from-end]:animate-enter-from-right",
        // "data-[motion=to-start]:animate-exit-to-left",
        // "data-[motion=to-end]:animate-exit-to-right",
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
    <div className="absolute top-full left-0 isolate z-0 flex justify-center">
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "relative origin-top-center mt-0 bg-background rounded-md overflow-hidden",
          "shadow-3 h-[var(--radix-navigation-menu-viewport-height)] w-full sm:w-[var(--radix-navigation-menu-viewport-width)]",
          className,
        )}
        {...props}
      />
    </div>
  );
};

const NavigationMenuItem: FC<
  ComponentProps<typeof NavigationMenuPrimitive.Item>
> = ({ className, ...props }) => {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  );
};

const NavigationMenuLink: FC<
  ComponentProps<typeof NavigationMenuPrimitive.Link>
> = ({ className, ...props }) => {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "block no-underline leading-none outline-none select-none",
        "py-2 px-3 rounded-sm",
        "data-[status=active]:text-accent-12 text-gray-12 hover:bg-accentA-3 active:bg-accentA-4",
        "data-[status=active]:bg-accentA-4",
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
