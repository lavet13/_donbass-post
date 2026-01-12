import { cn } from "../lib/utils";
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
      data-slot="tabs"
      className={cn("flex w-full max-w-[300px] flex-col", className)}
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
    backgroundColor: "var(--gray-a3)",
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
      backgroundColor: isActive ? "var(--accent-a3)" : "var(--gray-a3)",
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
      data-slot="tabs-list"
      className={cn(
        "relative flex shrink-0 rounded-tl-md rounded-tr-md shadow-(--base-card-surface-box-shadow)",
        className,
      )}
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
        className="active:bg-accentA-4! pointer-events-none absolute top-1/2 z-1 h-[30px] -translate-y-1/2 rounded-md transition-all duration-200 ease-out"
        style={hoverStyle}
      />
      <div
        className="bg-accent-indicator absolute bottom-0 h-0.5 transition-all duration-200 ease-out"
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
      data-slot="tabs-trigger"
      ref={triggerRef}
      className={cn(
        "relative flex h-[45px] flex-1 items-center justify-center px-5 text-sm outline-none",
        "focus-visible:ring-accent-8 leading-none select-none focus-visible:ring-[2px]",
        "hover:data-[state=active]:text-accent-10! data-[state=active]:text-accent-9 transition-colors duration-150",
        "bg-panel first-of-type:rounded-tl-md last-of-type:rounded-tr-md",
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
      data-panel-background="solid"
      data-slot="tabs-content"
      className={cn(
        "bg-panel grow p-5 outline-none focus-visible:[box-shadow:0_0_0_2px_var(--accent-8)]",
        "rounded-br-md rounded-bl-md shadow-(--base-card-surface-box-shadow)",
        className,
      )}
      {...props}
    />
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
