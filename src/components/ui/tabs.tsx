import { cn } from "@/lib/utils";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type FC,
} from "react";
import { isMobile } from "react-device-detect";

const Tabs: FC<ComponentProps<typeof TabsPrimitive.Root>> = ({
  className,
  ...props
}) => {
  return (
    <TabsPrimitive.Root
      className={cn("flex flex-col max-w-[300px] w-full", className)}
      {...props}
    />
  );
};

const TabsList: FC<ComponentProps<typeof TabsPrimitive.List>> = ({
  className,
  ...props
}) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [activeStyles, setActiveStyles] = useState({
    left: "0px",
    width: "0px",
  });
  const [hoverStyle, setHoverStyle] = useState({
    left: "0px",
    width: "0px",
    opacity: 0,
    backgroundColor: "rgb(from var(--color-muted) r g b / 0.3)",
  });

  const updateHoverIndicator = (
    element: HTMLElement | null,
    { isActive = false }: { isActive?: boolean } = {},
  ) => {
    if (!element) {
      setHoverStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const { offsetLeft, offsetWidth } = element;
    setHoverStyle({
      left: `${offsetLeft + 5}px`,
      width: `${offsetWidth - 10}px`,
      opacity: 1,
      backgroundColor: isActive
        ? "rgb(from var(--color-primary) r g b / 0.2)"
        : "rgb(from var(--color-primary) r g b / 0.1)",
    });
  };

  const updateIndicator = () => {
    if (!listRef.current) return;

    const activeTab = listRef.current.querySelector('[data-state="active"]') as
      | HTMLElement
      | undefined;
    if (activeTab) {
      const { offsetLeft, offsetWidth } = activeTab;
      setActiveStyles({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
    }
  };

  useEffect(() => {
    // Initial positioning
    requestAnimationFrame(updateIndicator);

    // Listen for tab changes
    const mutationObserver = new MutationObserver(updateIndicator);

    // Listen for the list container's width
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateIndicator);
    });

    if (listRef.current) {
      mutationObserver.observe(listRef.current, {
        subtree: true,
        attributeFilter: ["data-state"],
      });
      resizeObserver.observe(listRef.current);
    }

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <TabsPrimitive.List
      className={cn("relative shrink-0 flex border-b border-input", className)}
      ref={listRef}
      {...(isMobile
        ? { onTouchEnd: () => updateHoverIndicator(null) }
        : { onMouseLeave: () => updateHoverIndicator(null) })}
      {...props}
    >
      {typeof props.children === "object" && Array.isArray(props.children)
        ? props.children.map((child) =>
            child && typeof child === "object" && "props" in child
              ? {
                  ...child,
                  props: {
                    ...child.props,
                    onHoverChange: (
                      ...rest: [HTMLElement | null, { isActive?: boolean }]
                    ) => updateHoverIndicator(...rest),
                  },
                }
              : child,
          )
        : props.children}
      <div
        className="absolute z-1 top-1/2 -translate-y-1/2 h-[30px] transition-all duration-200 ease-out pointer-events-none rounded-md"
        style={hoverStyle}
      />
      <div
        className="absolute bottom-0 h-0.5 bg-primary transition-all duration-200 ease-out"
        style={activeStyles}
      />
    </TabsPrimitive.List>
  );
};

const TabsTrigger: FC<
  ComponentProps<typeof TabsPrimitive.Trigger> & {
    onHoverChange?: (
      element: HTMLElement | null,
      { isActive }: { isActive?: boolean },
    ) => void;
  }
> = ({ className, onHoverChange, ...props }) => {
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const isActive = triggerRef.current?.getAttribute("data-state") === "active";

  return (
    <TabsPrimitive.Trigger
      ref={triggerRef}
      className={cn(
        "relative flex-1 flex items-center justify-center px-5 h-[45px] text-sm outline-none",
        "leading-none select-none",
        "hover:text-primary! data-[state=active]:text-primary transition-colors duration-150",
        "first-of-type:rounded-tl-md last-of-type:rounded-tr-md bg-popover",
        className,
      )}
      {...(isMobile
        ? {
            onTouchStart: () => {
              if (onHoverChange && triggerRef.current) {
                onHoverChange(triggerRef.current, { isActive });
              }
            },
          }
        : {
            onMouseEnter: () => {
              if (onHoverChange && triggerRef.current) {
                onHoverChange(triggerRef.current, { isActive });
              }
            },
          })}
      {...props}
    />
  );
};

const TabsContent: FC<ComponentProps<typeof TabsPrimitive.Content>> = ({
  className,
  ...props
}) => {
  return (
    <TabsPrimitive.Content
      className={cn(
        "grow p-5 bg-popover outline-none focus-visible:[box-shadow:0_0_0_2px_var(--color-primary)]",
        "rounded-bl-md rounded-br-md",
        className,
      )}
      {...props}
    />
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
