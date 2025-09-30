import { cn } from "@/lib/utils";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import type { ComponentProps, FC } from "react";

const NavigationMenu: FC<
  ComponentProps<typeof NavigationMenuPrimitive.Root>
> = ({ className, ...props }) => {
  return (
    <NavigationMenuPrimitive.Root
      className={cn("relative flex justify-center z-1", className)}
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
        "flex justify-center bg-grayA-1 rounded-full list-none p-1 m-0",
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
      onPointerMove={(event) => event.preventDefault()}
      onPointerLeave={(event) => event.preventDefault()}
      className={cn(
        "flex items-center justify-center gap-[2px]",
        "py-2 px-1.5 whitespace-nowrap overflow-hidden text-ellipsis outline-none select-none",
        "text-accent-11 bg-accentA-2 hover:bg-accentA-3 leading-none",
        "[&[data-state='open']>svg]:-rotate-180 [&_svg]:size-4 [&_svg]:duration-150",
        "[&[data-state='open']]:bg-accentA-4",
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
        "absolute top-0 left-0 w-full flex-1",
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
    <div className="absolute flex justify-center w-full top-full left-0">
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        onPointerLeave={(event) => event.preventDefault()}
        className={cn(
          "relative top-full [transform-origin:top_center] mt-0 bg-background rounded-md overflow-hidden",
          "shadow-3 h-[var(--radix-navigation-menu-viewport-height)] w-full sm:min-w-[var(--radix-navigation-menu-viewport-width)]",
          "[transition:width,height,300ms_ease]",
          // "data-[state=open]:animate-scale-in",
          // "data-[state=closed]:animate-scale-out",
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
