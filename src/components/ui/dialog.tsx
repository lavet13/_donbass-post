import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import type { ComponentProps, FC } from "react";

const Dialog: FC<ComponentProps<typeof DialogPrimitive.Root>> = (props) => {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
};

const DialogTrigger: FC<ComponentProps<typeof DialogPrimitive.Trigger>> = ({
  ...props
}) => {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
};

const DialogContent: FC<
  ComponentProps<typeof DialogPrimitive.Content> & { showCloseButton?: boolean }
> = ({ className, children, showCloseButton = false, ...props }) => {
  return (
    <DialogPrimitive.Portal data-slot="dialog-portal">
      <DialogPrimitive.Overlay
        className="fixed inset-0 bg-modal-backdrop z-20 data-[state=open]:animate-overlay-show"
        data-slot="dialog-overlay"
      />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed md:rounded-2xl top-1/2 outline-none left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background z-20 grid gap-4 data-[state=open]:animate-slide-up-and-fade duration-200",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && <DialogClose />}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
};

const DialogTitle: FC<ComponentProps<typeof DialogPrimitive.Title>> = ({
  className,
  ...props
}) => {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-xl leading-none font-semibold", className)}
      {...props}
    />
  );
};

const DialogDescription: FC<
  ComponentProps<typeof DialogPrimitive.Description>
> = ({ className, ...props }) => {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
};

const DialogHeader: FC<ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
};

const DialogFooter: FC<ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
};

const DialogClose: FC<ComponentProps<typeof DialogPrimitive.Close>> = ({
  className,
  ...props
}) => {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      className={cn(
        "hover:bg-primary/80 size-8 flex items-center justify-center data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xl transition-colors text-accent-foreground bg-accent/80 dark:text-foreground hover:text-primary-foreground focus:outline-hidden ring-ring active:ring-2 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
        className,
      )}
      {...props}
    >
      <XIcon />
      <span className="sr-only">Закрыть</span>
    </DialogPrimitive.Close>
  );
};

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogHeader,
  DialogFooter,
};
