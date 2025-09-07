import { useContainerQuery } from "@/hooks/use-container-query";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import {
  Children,
  createContext,
  Fragment,
  isValidElement,
  useContext,
  useRef,
  useState,
  type ComponentProps,
  type FC,
  type ReactNode,
} from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Link, Outlet } from "@tanstack/react-router";
import { ModeToggle } from "@/components/mode-toggle";
import { useTheme } from "@/hooks/use-theme";
import { Slot, Slottable } from "@radix-ui/react-slot";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { cva, type VariantProps } from "class-variance-authority";

type SidebarContextProps = {
  panelRef: React.RefObject<ImperativePanelHandle | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isCollapsed: boolean;
  collapsedSize: number;
  minimalSize: number;
  expandedSize: number;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextProps | null>(null);

const SidebarProvider: FC<ComponentProps<"div">> = ({ children }) => {
  const styles = getComputedStyle(document.documentElement);

  const middleBreakpoint = styles.getPropertyValue("--breakpoint-md");
  const isMobile = useMediaQuery(
    `(max-width: calc(${middleBreakpoint} - 1px))`,
  );

  const isPreMobile = useMediaQuery(`(min-width: ${middleBreakpoint})`);

  const largeBreakpoint = styles.getPropertyValue("--breakpoint-lg");
  const isTablet = useMediaQuery(`(min-width: ${largeBreakpoint})`);

  const desktopBreakpoint = styles.getPropertyValue("--breakpoint-xl");
  const isDesktop = useMediaQuery(`(min-width: ${desktopBreakpoint})`);

  const fullHDBreakpoint = styles.getPropertyValue("--breakpoint-2xl");
  const isFullHD = useMediaQuery(`(min-width: ${fullHDBreakpoint})`);

  const collapsedSizePercent = isFullHD
    ? 4
    : isDesktop
      ? 6
      : isTablet
        ? 7
        : isPreMobile
          ? 8
          : 0;
  const minimalSizePercent =
    collapsedSizePercent +
    (isFullHD ? 12 : isDesktop ? 14 : isTablet ? 18 : isPreMobile ? 25 : 16);
  const expandedSizePercent = isFullHD
    ? 20
    : isDesktop
      ? 22
      : isTablet
        ? 32
        : isPreMobile
          ? 40
          : 16;

  const panelRef = useRef<ImperativePanelHandle>(null);
  const { ref: containerRef, isMatched: isCollapsed } =
    useContainerQuery<HTMLDivElement>("min-width: 1px and max-width: 130px");

  const toggleSidebar = () => {
    if (panelRef.current) {
      if (panelRef.current.isCollapsed()) {
        panelRef.current.expand();
      } else {
        panelRef.current.collapse();
      }
    }
  };

  // const contextValue = useMemo<SidebarContextProps>(
  //   () => ({
  //     expandedSize: expandedSizePercent,
  //     collapsedSize: collapsedSizePercent,
  //     minimalSize: minimalSizePercent,
  //     panelRef,
  //     isCollapsed,
  //     containerRef,
  //     isMobile,
  //     toggleSidebar,
  //   }),
  //   [
  //     expandedSizePercent,
  //     collapsedSizePercent,
  //     minimalSizePercent,
  //     panelRef.current,
  //     isCollapsed,
  //     containerRef.current,
  //     isMobile,
  //     toggleSidebar,
  //   ],
  // );

  const contextValue: SidebarContextProps = {
    expandedSize: expandedSizePercent,
    collapsedSize: collapsedSizePercent,
    minimalSize: minimalSizePercent,
    panelRef,
    isCollapsed,
    containerRef,
    isMobile,
    toggleSidebar,
  };

  return (
    <SidebarContext value={contextValue}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext>
  );
};

const useSidebar = () => {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }

  return context;
};

const SidebarHeader: FC<ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn(
        "sticky top-0 z-10 @max-[130px]:text-center flex @max-[130px]:justify-center justify-between gap-1 items-center mt-1 lg:pl-3 px-[0.5rem] @max-[130px]:px-0",
        className,
      )}
      {...props}
    />
  );
};

const SidebarFooter: FC<ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <div
      data-sidebar="footer"
      data-slot="sidebar-footer"
      className={cn(
        "sticky bottom-0 z-10 pb-2 flex flex-col justify-center px-[0.5rem]",
        className,
      )}
      {...props}
    />
  );
};

const SidebarContent: FC<ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <div
      data-sidebar="content"
      data-slot="sidebar-content"
      className={cn(
        "pt-2 flex-1 flex flex-col min-h-0 overflow-auto",
        className,
      )}
      {...props}
    />
  );
};

const MainContent: FC<ComponentProps<"div">> = (props) => {
  return (
    <main className="h-full flex flex-col grow shrink-0 overflow-y-auto">
      <div
        className="flex-1 flex flex-col max-h-screen overflow-y-auto"
        {...props}
      />
    </main>
  );
};

const SidebarMenuGroup: FC<ComponentProps<"div">> = ({
  className,
  ...props
}) => {
  return (
    <div
      data-sidebar="group"
      className={cn(
        "flex w-full min-w-0 flex-col shrink-0 py-[2px] px-[0.5rem]",
        className,
      )}
      {...props}
    />
  );
};

const SidebarMenu: FC<ComponentProps<"ul">> = ({ className, ...props }) => {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn(
        "flex w-full min-w-0 flex-col cursor-default gap-px",
        className,
      )}
      {...props}
    />
  );
};

type SidebarMenuContextProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleMenu: () => void;
  hasSidebarSubMenu: boolean;
};

const SidebarMenuContext = createContext<SidebarMenuContextProps | null>(null);

const useSidebarMenu = () => {
  const context = useContext(SidebarMenuContext);

  if (!context) {
    throw new Error("useSidebarMenu must be used within a SidebarMenuProvider");
  }

  return context;
};

const SidebarMenuItem: FC<ComponentProps<"li"> & { label?: string }> = ({
  className,
  children,
  label,
  ...props
}) => {
  const { isCollapsed } = useSidebar();
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen(!open);

  const sidebarMenuButton = Children.toArray(children).find(
    (child) =>
      isValidElement(child) &&
      (child.type === SidebarMenuLink || child.type === SidebarMenuButton),
  );

  const sidebarMenuSub = Children.toArray(children).find(
    (child) => isValidElement(child) && child.type === SidebarMenuSub,
  );

  const hasSidebarSubMenu = !!sidebarMenuSub;

  const contextValue: SidebarMenuContextProps = {
    open,
    setOpen,
    toggleMenu,
    hasSidebarSubMenu,
  };

  if (isCollapsed && hasSidebarSubMenu) {
    return (
      <SidebarMenuContext value={contextValue}>
        <li
          data-slot="sidebar-menu-item"
          data-sidebar="menu-item"
          className={cn("relative flex flex-col list-none gap-px", className)}
          {...props}
        >
          <HoverCard>
            <HoverCardTrigger asChild>{sidebarMenuButton}</HoverCardTrigger>
            <HoverCardContent className="w-[240px]">
              <span className="px-4 text-sm leading-3 my-1">{label}</span>
              {sidebarMenuSub}
            </HoverCardContent>
          </HoverCard>
        </li>
      </SidebarMenuContext>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarMenuContext value={contextValue}>
        <li
          data-slot="sidebar-menu-item"
          data-sidebar="menu-item"
          className={cn("relative flex flex-col list-none gap-px", className)}
          {...props}
        >
          {children}
        </li>
      </SidebarMenuContext>
    </Collapsible>
  );
};

// const SidebarSeparator: FC<ComponentProps<typeof Separator>> = ({
//   className,
//   ...props
// }) {
//   return (
//     <Separator
//       data-slot="sidebar-separator"
//       data-sidebar="separator"
//       className={cn("bg-sidebar-border mx-2 w-auto", className)}
//       {...props}
//     />
//   );
// }

const SidebarMenuLink: FC<
  ComponentProps<typeof SidebarMenuButton> & ComponentProps<typeof Link>
> = ({ to, children, activeOptions, ...props }) => {
  const { isInSubmenu } = useSidebarMenuSub();
  const { isCollapsed } = useSidebar();

  return (
    <SidebarMenuButton asChild {...props}>
      <Link activeOptions={activeOptions} to={to}>
        {(!isCollapsed || isInSubmenu) && <span>{children}</span>}
      </Link>
    </SidebarMenuButton>
  );
};

const sidebarMenuButtonVariants = cva(
  cn(
    "peer/menu-button flex w-full items-center justify-start gap-2 overflow-hidden rounded-lg px-3 text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground",
    "disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    "data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground data-[status=active]:font-medium",
    "[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
    "[[data-slot='hover-card-content']_&]:justify-start",
  ),
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      },
      size: {
        default: "h-9 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const SidebarMenuButton: FC<
  ComponentProps<"button"> & { asChild?: boolean } & VariantProps<
      typeof sidebarMenuButtonVariants
    > &
    ComponentProps<typeof Tooltip> & {
      leftElement?: ReactNode;
      rightElement?: ReactNode;
    }
> = ({
  asChild = false,
  variant = "default",
  size = "default",
  className,
  content,
  leftElement,
  rightElement,
  children,
  side = "right",
  ...props
}) => {
  const Comp = asChild ? Slot : "button";
  const { open, toggleMenu, hasSidebarSubMenu } = useSidebarMenu();
  const { isInSubmenu } = useSidebarMenuSub();
  const [isHovered, setIsHovered] = useState(false);
  const { isCollapsed } = useSidebar();

  const renderButton = () => (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      className={cn(
        sidebarMenuButtonVariants({ variant, size }),
        isCollapsed && "justify-center",
        className,
      )}
      {...props}
    >
      {leftElement}
      <Slottable>{children}</Slottable>
      {rightElement}
    </Comp>
  );

  if (isCollapsed) {
    if (hasSidebarSubMenu) {
      return renderButton();
    }
    return (
      <Tooltip side={side} content={content}>
        {renderButton()}
      </Tooltip>
    );
  }

  return (
    <Comp
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      title={content}
      className={cn(
        sidebarMenuButtonVariants({ variant, size }),
        isCollapsed && !isInSubmenu && "justify-center",
        className,
      )}
      {...props}
    >
      {isHovered && hasSidebarSubMenu && !isInSubmenu ? (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleMenu();
          }}
          data-slot="sidebar-collapsible-button"
          data-sidebar="collapsible-button"
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "size-4",
            "[&[data-sidebar='collapsible-button']]:text-sidebar-accent-foreground!",
            "[&[data-sidebar='collapsible-button']]:hover:bg-sidebar-accent-foreground/10",
            "[&[data-sidebar='collapsible-button']]:active:bg-sidebar-accent-foreground/20",
            "[[data-status=active]_&]:text-sidebar-accent-foreground!",
          )}
        >
          <ChevronRight
            className={cn(
              open ? "rotate-90" : "rotate-0",
              "transition-transform duration-200",
            )}
          />
        </Button>
      ) : (
        leftElement
      )}
      <Slottable>{children}</Slottable>
      {rightElement}
    </Comp>
  );
};

type SidebarMenuSubContextProps = {
  isInSubmenu: boolean;
};

// Add a new context for submenu
const SidebarMenuSubContext = createContext<SidebarMenuSubContextProps>({
  isInSubmenu: false,
});

const useSidebarMenuSub = () => useContext(SidebarMenuSubContext);

const SidebarMenuSub: FC<ComponentProps<"ul">> = ({ className, ...props }) => {
  const { isCollapsed } = useSidebar();
  const { toggleMenu } = useSidebarMenu();

  if (isCollapsed) {
    return (
      <SidebarMenuSubContext value={{ isInSubmenu: true }}>
        <ul
          data-slot="sidebar-menu-sub"
          data-sidebar="menu-sub"
          className={cn("flex flex-col gap-px w-full min-w-0", className)}
          {...props}
        />
      </SidebarMenuSubContext>
    );
  }

  return (
    <CollapsibleContent>
      <div className="flex flex-row gap-px mx-1">
        <div
          onClick={toggleMenu}
          className="cursor-pointer ms-[8px] me-[2px] py-1"
        >
          <div className="border-l border-border h-full ms-[10px] me-[4px]" />
        </div>

        <SidebarMenuSubContext value={{ isInSubmenu: true }}>
          <ul
            data-slot="sidebar-menu-sub"
            data-sidebar="menu-sub"
            className={cn("flex flex-col gap-px w-full min-w-0", className)}
            {...props}
          />
        </SidebarMenuSubContext>
      </div>
    </CollapsibleContent>
  );
};

const SidebarMenuSubItem: FC<ComponentProps<"li">> = ({
  className,
  ...props
}) => {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("relative list-none", className)}
      {...props}
    />
  );
};

const SidebarModeToggle: FC<
  ComponentProps<typeof ModeToggle> & ComponentProps<typeof Tooltip>
> = ({ className, side = "right", ...props }) => {
  const { isCollapsed } = useSidebar();
  const { theme } = useTheme();

  let content = "";
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (theme === "dark") {
    content = "Изменить на светлую тему";
  } else if (theme === "light") {
    content = "Изменить на темную тему";
  } else {
    content = isDark ? "Изменить на светлую тему" : "Изменить на темную тему";
  }

  if (isCollapsed) {
    return (
      <Tooltip side={side} content={content}>
        <ModeToggle
          data-sidebar="menu-toggle"
          data-slot="sidebar-menu-toggle"
          className={cn(
            "text-sidebar-foreground w-full rounded-lg justify-center",
            "[&[data-sidebar='menu-toggle']]:hover:bg-sidebar-accent [&[data-sidebar='menu-toggle']]:hover:text-sidebar-accent-foreground",
            "[&[data-sidebar='menu-toggle']]:active:bg-sidebar-accent [&[data-sidebar='menu-toggle']]:active:text-sidebar-accent-foreground",
            className,
          )}
          {...props}
        />
      </Tooltip>
    );
  }

  return (
    <ModeToggle
      data-sidebar="menu-toggle"
      data-slot="sidebar-menu-toggle"
      title={content}
      className={cn(
        "text-sidebar-foreground w-full rounded-lg justify-start px-3 font-normal",
        "[&[data-sidebar='menu-toggle']]:hover:bg-sidebar-accent [&[data-sidebar='menu-toggle']]:hover:text-sidebar-accent-foreground",
        "[&[data-sidebar='menu-toggle']]:active:bg-sidebar-accent [&[data-sidebar='menu-toggle']]:active:text-sidebar-accent-foreground",
        className,
      )}
      {...props}
    >
      {content}
    </ModeToggle>
  );
};

const Sidebar: FC<ComponentProps<"div">> = (props) => {
  const {
    expandedSize,
    containerRef,
    panelRef,
    minimalSize,
    collapsedSize,
    isMobile,
    toggleSidebar,
  } = useSidebar();

  return (
    <Fragment>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          ref={panelRef}
          className="bg-sidebar text-sidebar-foreground has-[~[data-resize-handle-active]]:duration-100 transition-[flex]"
          collapsedSize={collapsedSize}
          collapsible
          defaultSize={expandedSize}
          maxSize={expandedSize}
          minSize={minimalSize}
        >
          <div
            ref={containerRef}
            className="h-full @container flex flex-col overflow-y-auto min-h-screen"
            {...props}
          />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel>
          <MainContent>
            {panelRef.current?.isCollapsed() && (
              <div
                className={cn(
                  "container sticky top-0.5 mt-1",
                  !isMobile && "hidden",
                )}
              >
                <Tooltip
                  side="right"
                  content={
                    panelRef.current?.isExpanded()
                      ? "Свернуть панель"
                      : "Открыть панель"
                  }
                >
                  <Button
                    data-sidebar="trigger"
                    data-slot="sidebar-trigger"
                    className="text-accent-foreground rounded-full"
                    variant="outline"
                    size="icon"
                    onClick={toggleSidebar}
                  >
                    {panelRef.current?.isCollapsed() ? (
                      <PanelLeftOpen />
                    ) : (
                      <PanelLeftClose />
                    )}
                  </Button>
                </Tooltip>
              </div>
            )}

            <div className="container">
              <Outlet />
            </div>
          </MainContent>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Fragment>
  );
};

export {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarMenuGroup,
  SidebarMenu,
  SidebarModeToggle,
  SidebarMenuButton,
  SidebarMenuLink,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  useSidebar,
};
