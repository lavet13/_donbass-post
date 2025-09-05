import { cn } from "@/lib/utils";
import * as PasswordToggleFieldPrimitive from "@radix-ui/react-password-toggle-field";
import type { ComponentProps, FC } from "react";
import { Input } from "@/components/ui/input";

const PasswordToggleField: FC<
  ComponentProps<typeof PasswordToggleFieldPrimitive.Root>
> = (props) => {
  return (
    <div className="relative">
      <PasswordToggleFieldPrimitive.Root
        data-slot="password-toggle-field"
        {...props}
      />
    </div>
  );
};

const PasswordToggleFieldInput: FC<
  ComponentProps<typeof PasswordToggleFieldPrimitive.Input>
> = ({ className, ...props }) => {
  return (
    <Input
      data-slot="password-toggle-field-input"
      className={cn("pr-[30px]", className)}
      {...props}
      asChild
    >
      <PasswordToggleFieldPrimitive.Input />
    </Input>
  );
};

const PasswordToggleFieldToggle: FC<
  ComponentProps<typeof PasswordToggleFieldPrimitive.Toggle>
> = ({ className, id, ...props }) => {
  return (
    <PasswordToggleFieldPrimitive.Toggle
      data-slot="password-toggle-field-toggle"
      className={cn(
        "flex items-center justify-center aspect-[1] rounded-lg [&_svg]:size-5",
        "focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none",
        "absolute right-0 top-1/2 -translate-y-1/2 mr-2",
        className,
      )}
      id={undefined}
      aria-describedby={id}
      {...props}
    />
  );
};

const PasswordToggleFieldIcon: FC<
  ComponentProps<typeof PasswordToggleFieldPrimitive.Icon>
> = (props) => {
  return (
    <PasswordToggleFieldPrimitive.Icon
      data-slot="password-toggle-field-icon"
      {...props}
    />
  );
};

export {
  PasswordToggleField,
  PasswordToggleFieldInput,
  PasswordToggleFieldToggle,
  PasswordToggleFieldIcon,
};
