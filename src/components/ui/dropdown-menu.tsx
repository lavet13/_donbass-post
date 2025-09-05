import { cn } from "@/lib/utils";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type { ComponentProps, FC } from "react";

const DropdownMenu: FC<ComponentProps<typeof DropdownMenuPrimitive.Root>> = (
  props,
) => {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
};

const DropdownMenuTrigger: FC<
  ComponentProps<typeof DropdownMenuPrimitive.Trigger>
> = ({ className, ...props }) => {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      className={cn("", className)}
      {...props}
    />
  );
};

const DropdownMenuContent: FC<
  ComponentProps<typeof DropdownMenuPrimitive.Content>
> = ({ className, ...props }) => {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        className={cn("", className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
};

const DropdownMenuLabel: FC<
  ComponentProps<typeof DropdownMenuPrimitive.Label>
> = ({ className, ...props }) => {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      className={cn("", className)}
      {...props}
    />
  );
};

const DropdownMenuItem: FC<
  ComponentProps<typeof DropdownMenuPrimitive.Item>
> = ({ className, ...props }) => {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn("", className)}
      {...props}
    />
  );
};

const DropdownMenuGroup: FC<
  ComponentProps<typeof DropdownMenuPrimitive.Group>
> = ({ className, ...props }) => {
  return (
    <DropdownMenuPrimitive.Group
      data-slot="dropdown-menu-group"
      className={cn("", className)}
      {...props}
    />
  );
};

const DropdownMenuCheckboxItem: FC<
  ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>
> = ({ className, ...props }) => {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn("", className)}
      {...props}
    />
  );
};

const DropdownMenuItemIndicator: FC<
  ComponentProps<typeof DropdownMenuPrimitive.ItemIndicator>
> = ({ className, ...props }) => {
  return (
    <DropdownMenuPrimitive.ItemIndicator
      data-slot="dropdown-menu-item-indicator"
      className={cn("", className)}
      {...props}
    />
  );
};

const DropdownMenuRadioGroup: FC<
  ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>
> = ({ className, ...props }) => {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      className={cn("", className)}
      {...props}
    />
  );
};

const DropdownMenuRadioItem: FC<
  ComponentProps<typeof DropdownMenuPrimitive.RadioItem>
> = ({ className, ...props }) => {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn("", className)}
      {...props}
    />
  );
};

const DropdownMenuSub: FC<ComponentProps<typeof DropdownMenuPrimitive.Sub>> = (
  props,
) => {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
};

const DropdownMenuSubTrigger: FC<
  ComponentProps<typeof DropdownMenuPrimitive.SubTrigger>
> = ({ className, ...props }) => {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      className={cn("", className)}
      {...props}
    />
  );
};

const DropdownMenuSubContent: FC<
  ComponentProps<typeof DropdownMenuPrimitive.SubContent>
> = ({ className, ...props }) => {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        data-slot="dropdown-menu-sub-content"
        className={cn("", className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuItemIndicator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
