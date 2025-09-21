import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium text-sm rounded-sm disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/85 active:text-muted-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/75",
        ghost:
          "text-secondary-foreground dark:hover:bg-primary/10 dark:active:bg-primary/20 hover:bg-primary/10 active:bg-primary/15",
        outline:
          "[box-shadow:inset_0_0_0_1px_var(--border)] hover:[box-shadow:inset_0_0_0_1px_rgb(from_var(--ring)_calc(r*0.9)_calc(g*0.9)_calc(b*0.9))] active:bg-ring/30 active:[box-shadow:inset_0_0_0_1px_rgb(from_var(--ring)_calc(r*0.9)_calc(g*0.9)_calc(b*0.9))]",
      },
      size: {
        default: "h-8 px-4 py-2 has-[>svg]:px-3",
        xs: "h-7 rounded-sm px-2 gap-1 has-[>svg]:px-2",
        sm: "h-8 rounded-sm gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-sm px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button: React.FC<
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & { asChild?: boolean }
> = ({ className, variant, size, asChild = false, ...props }) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      role="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};

export { Button, buttonVariants };
