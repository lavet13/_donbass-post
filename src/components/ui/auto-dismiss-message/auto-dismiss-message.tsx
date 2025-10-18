import { createContext } from "@/hooks/create-context";
import { useControllableState } from "@/hooks/use-controllable-state";
import { useMessageTimer } from "@/hooks/use-message-timer";
import { cn, composeEventHandlers } from "@/lib/utils";
import { Slot } from "@radix-ui/themes";
import { CheckCircle, CircleX, Info, TriangleAlert, X } from "lucide-react";
import React, {
  Fragment,
  type ComponentProps,
  type FC,
  type SVGProps,
} from "react";

/* -------------------------------------------------------------------------------------------------
 * AutoDismissMessage
 * -----------------------------------------------------------------------------------------------*/

const AUTO_DISMISS_MESSAGE_NAME = "AutoDismissMessage";

type Variant = "success" | "warning" | "info" | "error";

type AutoDismissMessageContextValue = {
  variant: Variant;
  open: boolean;
  onOpenChange(open: boolean): void;
  remainingTime: number;
  durationMs: number;
};

const [AutoDismissMessageProvider, useAutoDismissMessageContext] =
  createContext<AutoDismissMessageContextValue>(AUTO_DISMISS_MESSAGE_NAME);

/* -------------------------------------------------------------------------------------------------
 * AutoDismissMessage Root
 * -----------------------------------------------------------------------------------------------*/

interface AutoDismissMessageProps {
  children?: React.ReactNode;
  variant?: Variant;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  durationMs?: number;
}

const AutoDismissMessage: React.FC<AutoDismissMessageProps> = (props) => {
  const {
    children,
    variant = "success",
    open: openProp,
    defaultOpen,
    onOpenChange,
    durationMs = 15000,
  } = props;

  const [open, setOpen] = useControllableState({
    defaultProp: defaultOpen ?? false,
    prop: openProp,
    onChange: onOpenChange,
    caller: AUTO_DISMISS_MESSAGE_NAME,
  });

  const remainingTime = useMessageTimer({
    open,
    onEnd: React.useCallback(() => setOpen((open) => !open), [setOpen]),
    durationMs,
  });

  if (!open) return null;

  return (
    <AutoDismissMessageProvider
      durationMs={durationMs}
      remainingTime={remainingTime}
      variant={variant}
      open={open}
      onOpenChange={setOpen}
    >
      {children}
    </AutoDismissMessageProvider>
  );
};

AutoDismissMessage.displayName = AUTO_DISMISS_MESSAGE_NAME;

/* -------------------------------------------------------------------------------------------------
 * AutoDismissMessage Container
 * -----------------------------------------------------------------------------------------------*/

const CONTAINER_NAME = "AutoDismissMessageContainer";

type AutoDismissMessageContainerProps = ComponentProps<"div"> & {
  asChild?: boolean;
};

const AutoDismissMessageContainer: FC<AutoDismissMessageContainerProps> = (
  props,
) => {
  const { asChild = false, className, ...containerProps } = props;
  const context = useAutoDismissMessageContext(CONTAINER_NAME);
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn(
        "relative mb-2 flex flex-col gap-y-1 rounded-lg border p-3",
        context.variant === "success" &&
          "text-green-11 bg-green-3 border-green-6",
        context.variant === "info" && "text-iris-11 bg-iris-3 border-iris-6",
        context.variant === "warning" &&
          "text-orange-11 bg-orange-3 border-orange-6",
        context.variant === "error" &&
          "text-tomato-11 bg-tomato-3 border-tomato-6",
        className,
      )}
      {...containerProps}
    />
  );
};
AutoDismissMessageContainer.displayName = CONTAINER_NAME;

/* -------------------------------------------------------------------------------------------------
 * AutoDismissMessage Icon
 * -----------------------------------------------------------------------------------------------*/

const ICON_NAME = "AutoDismissMessageIcon";

const ICON_MAP = {
  success: CheckCircle,
  info: Info,
  warning: TriangleAlert,
  error: CircleX,
} as const;

type AutoDismissMessageIconProps = SVGProps<SVGSVGElement>;

const AutoDismissMessageIcon: FC<AutoDismissMessageIconProps> = (props) => {
  const { className, ...iconProps } = props;
  const context = useAutoDismissMessageContext(ICON_NAME);
  const Icon = ICON_MAP[context.variant];

  return <Icon className={cn("size-5 shrink-0", className)} {...iconProps} />;
};
AutoDismissMessageIcon.displayName = ICON_NAME;

/* -------------------------------------------------------------------------------------------------
 * AutoDismissMessage Title
 * -----------------------------------------------------------------------------------------------*/

const TITLE_NAME = "AutoDismissMessageTitle";

type AutoDismissMessageTitleProps = ComponentProps<"div"> & {
  asChild?: boolean;
};

const AutoDismissMessageTitle: FC<AutoDismissMessageTitleProps> = (props) => {
  const { asChild = false, className, ...titleProps } = props;
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn("flex items-center gap-3 pt-4 sm:pt-0", className)}
      {...titleProps}
    >
      {asChild ? (
        props.children
      ) : (
        <>
          <AutoDismissMessageIcon />
          <p className="font-bold">{props.children}</p>
        </>
      )}
    </Comp>
  );
};
AutoDismissMessageTitle.displayName = TITLE_NAME;

/* -------------------------------------------------------------------------------------------------
 * AutoDismissMessage Description
 * -----------------------------------------------------------------------------------------------*/

const DESCRIPTION_NAME = "AutoDismissMessageDescription";

type AutoDismissMessageDescriptionProps = ComponentProps<"span"> & {
  asChild?: boolean;
};

const AutoDismissMessageDescription: FC<AutoDismissMessageDescriptionProps> = (
  props,
) => {
  const { asChild = false, className, ...descriptionProps } = props;
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      className={cn("text-grayA-11 text-xs", className)}
      {...descriptionProps}
    />
  );
};
AutoDismissMessageDescription.displayName = DESCRIPTION_NAME;

/* -------------------------------------------------------------------------------------------------
 * AutoDismissMessage Content
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "AutoDismissMessageContent";

type AutoDismissMessageContentProps = ComponentProps<"div"> & {
  asChild?: boolean;
};

const AutoDismissMessageContent: FC<AutoDismissMessageContentProps> = (
  props,
) => {
  const { asChild = false, className, ...contentProps } = props;
  const Comp = asChild ? Slot : "div";

  return (
    <Comp className={cn("text-sm", className)} {...contentProps}>
      {typeof props.children === "object" && Array.isArray(props.children)
        ? props.children.map((node, index) => {
            if (typeof node === "string") {
              return (
                <p key={index} className="text-sm">
                  {node}
                </p>
              );
            } else {
              return <Fragment key={index}>{node}</Fragment>;
            }
          })
        : props.children}
    </Comp>
  );
};
AutoDismissMessageContent.displayName = CONTENT_NAME;

/* -------------------------------------------------------------------------------------------------
 * AutoDismissMessage Close
 * -----------------------------------------------------------------------------------------------*/

const CLOSE_NAME = "AutoDismissMessageClose";

type AutoDismissMessageCloseProps = ComponentProps<"button"> & {
  asChild?: boolean;
};

const AutoDismissMessageClose: FC<AutoDismissMessageCloseProps> = (props) => {
  const { asChild = false, className, onClick, ...closeProps } = props;
  const context = useAutoDismissMessageContext(CLOSE_NAME);
  const [isHovered, setIsHovered] = React.useState(false);
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      type={asChild ? undefined : "button"}
      aria-label="Закрыть сообщение"
      onMouseEnter={composeEventHandlers(props.onMouseEnter, () =>
        setIsHovered(true),
      )}
      onMouseLeave={composeEventHandlers(props.onMouseLeave, () =>
        setIsHovered(false),
      )}
      onClick={composeEventHandlers(onClick, () => context.onOpenChange(false))}
      className={cn(
        "pointer-events-auto absolute top-1 right-1 ml-auto inline-flex size-6 shrink-0 cursor-default items-center justify-center rounded-full text-sm outline-none [&_svg]:size-3 [&_svg]:shrink-0",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        context.variant === "success" &&
          "hover:bg-greenA-3 active:bg-greenA-4 focus-visible:border-green-6 focus-visible:ring-green-6/50",
        context.variant === "info" &&
          "hover:bg-irisA-3 active:bg-irisA-4 focus-visible:border-iris-6 focus-visible:ring-iris-6/50",
        context.variant === "warning" &&
          "hover:bg-warningA-3 active:bg-warningA-4 focus-visible:border-orange-6 focus-visible:ring-orange-6/50",
        context.variant === "error" &&
          "hover:bg-tomatoA-3 active:bg-tomatoA-4 focus-visible:border-tomato-6 focus-visible:ring-tomato-6/50",
        isHovered && "w-11 justify-between gap-0 px-1.5",
        context.remainingTime < 5 &&
          "w-11 animate-pulse justify-between gap-0 px-1.5",
        className,
      )}
      {...closeProps}
    >
      {asChild ? (
        props.children
      ) : (
        <>
          {isHovered
            ? context.remainingTime
            : context.remainingTime < 5 && context.remainingTime}
          <X />
        </>
      )}
    </Comp>
  );
};
AutoDismissMessageClose.displayName = CLOSE_NAME;

const Root = AutoDismissMessage;
const Container = AutoDismissMessageContainer;
const Icon = AutoDismissMessageIcon;
const Title = AutoDismissMessageTitle;
const Description = AutoDismissMessageDescription;
const Content = AutoDismissMessageContent;
const Close = AutoDismissMessageClose;

export { Root, Container, Icon, Title, Description, Content, Close };

export type {
  AutoDismissMessageProps,
  AutoDismissMessageContainerProps,
  AutoDismissMessageIconProps,
  AutoDismissMessageTitleProps,
  AutoDismissMessageDescriptionProps,
  AutoDismissMessageContentProps,
  AutoDismissMessageCloseProps,
};
