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
import type { TooltipProps } from "@radix-ui/themes";
import { Tooltip, IconButton, HoverCard, Text } from "@radix-ui/themes";
import { cn } from "@/lib/utils";
import { ChevronRight, Menu } from "lucide-react";
import { Link, Outlet } from "@tanstack/react-router";
import { ModeToggle } from "@/components/mode-toggle";
import { useTheme } from "@/hooks/use-theme";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { isMobile as isMobileDevice } from "react-device-detect";

type SidebarContextProps = {
  panelRef: React.RefObject<ImperativePanelHandle | null>;
  collapsedSize: number;
  minimalSize: number;
  expandedSize: number;
  isMobile: boolean;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  handleResize: (size: number) => void;
};

const SidebarContext = createContext<SidebarContextProps | null>(null);

const SidebarProvider: FC<ComponentProps<"div">> = ({ children }) => {
  const styles = getComputedStyle(document.documentElement);

  const middleBreakpoint = styles.getPropertyValue("--breakpoint-md");
  const isMobile =
    useMediaQuery(`(max-width: calc(${middleBreakpoint} - 1px))`) ||
    isMobileDevice;

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

  const [isCollapsed, setIsCollapsed] = useState(false);
  const panelRef = useRef<ImperativePanelHandle>(null);

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);

    if (panelRef.current) {
      if (newCollapsedState) {
        panelRef.current.resize(collapsedSizePercent);
      } else {
        panelRef.current.resize(expandedSizePercent);
      }
    }
  };

  const handleResize = (size: number) => {
    if (size <= collapsedSizePercent && !isCollapsed) {
      setIsCollapsed(true);
      if (panelRef.current) {
        panelRef.current.resize(collapsedSizePercent);
      }
    } else if (size > collapsedSizePercent && isCollapsed) {
      setIsCollapsed(false);
      if (panelRef.current) {
        panelRef.current.resize(expandedSizePercent);
      }
    }
  };

  const contextValue: SidebarContextProps = {
    expandedSize: expandedSizePercent,
    collapsedSize: collapsedSizePercent,
    minimalSize: minimalSizePercent,
    isCollapsed,
    panelRef,
    isMobile,
    toggleSidebar,
    handleResize,
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
        "sticky top-0 z-0 @max-[130px]:text-center flex @max-[130px]:justify-center justify-between gap-1 items-center mt-1 @min-[130px]:mr-1 @max-[130px]:mx-1",
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
        "sticky bottom-0 z-10 pb-2 flex flex-col gap-4 justify-center px-[0.5rem] mx-1 mb-1 mt-2",
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

const SidebarOutlet: FC = () => {
  return (
    <div className="container px-4">
      <Outlet />
    </div>
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
        "flex w-full min-w-0 flex-col shrink-0 py-[2px] px-3",
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
  const { isCollapsed, isMobile } = useSidebar();
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

  if (isCollapsed && !isMobile && hasSidebarSubMenu) {
    return (
      <SidebarMenuContext value={contextValue}>
        <li
          data-slot="sidebar-menu-item"
          data-sidebar="menu-item"
          className={cn("relative flex flex-col list-none gap-px", className)}
          {...props}
        >
          <HoverCard.Root openDelay={0} closeDelay={50}>
            <HoverCard.Trigger>{sidebarMenuButton}</HoverCard.Trigger>
            <HoverCard.Content
              side="right"
              align="start"
              sideOffset={0}
              className={cn(
                "w-[240px]",
                "outline-hidden z-0",

                // Invisible bridge for all sides
                "data-[side=right]:before:content-[''] data-[side=right]:before:absolute data-[side=right]:before:right-full data-[side=right]:before:top-0 data-[side=right]:before:w-2 data-[side=right]:before:h-full data-[side=right]:before:bg-transparent",
                "data-[side=left]:before:content-[''] data-[side=left]:before:absolute data-[side=left]:before:left-full data-[side=left]:before:top-0 data-[side=left]:before:w-2 data-[side=left]:before:h-full data-[side=left]:before:bg-transparent",
                "data-[side=top]:before:content-[''] data-[side=top]:before:absolute data-[side=top]:before:bottom-full data-[side=top]:before:left-0 data-[side=top]:before:w-full data-[side=top]:before:h-2 data-[side=top]:before:bg-transparent",
                "data-[side=bottom]:before:content-[''] data-[side=bottom]:before:absolute data-[side=bottom]:before:top-full data-[side=bottom]:before:left-0 data-[side=bottom]:before:w-full data-[side=bottom]:before:h-2 data-[side=bottom]:before:bg-transparent",
              )}
            >
              <Text
                as="span"
                color="gray"
                size="2"
                mb="1"
                className="inline-block px-4 leading-3"
              >
                {label}
              </Text>
              {sidebarMenuSub}
            </HoverCard.Content>
          </HoverCard.Root>
        </li>
      </SidebarMenuContext>
    );
  }

  return (
    <Collapsible open={isMobile || open} onOpenChange={setOpen}>
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
  const { isCollapsed, isMobile } = useSidebar();

  return (
    <SidebarMenuButton asChild {...props}>
      <Link activeOptions={activeOptions} to={to}>
        {(!isCollapsed || isInSubmenu || isMobile) && <span>{children}</span>}
      </Link>
    </SidebarMenuButton>
  );
};

const sidebarMenuButtonVariants = cva(
  cn(
    "rt-reset rt-BaseButton rt-r-size-2 rt-variant-ghost rt-IconButton rounded-full",
    "peer/menu-button flex w-full items-center justify-start gap-2 overflow-hidden outline-hidden transition-[width,height,padding]",
    "disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    "data-[status=active]:bg-accentA-4 data-[status=active]:font-medium",
    "[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
    "[[data-slot='hover-card-content']_&]:justify-start",
  ),
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
  const { isCollapsed, isMobile } = useSidebar();

  const renderButton = () => (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      className={cn(
        sidebarMenuButtonVariants(),
        isCollapsed && !isMobile && "justify-center",
        className,
      )}
      {...props}
    >
      {leftElement}
      <Slottable>{children}</Slottable>
      {rightElement}
    </Comp>
  );

  if (isCollapsed && !isMobile) {
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
        sidebarMenuButtonVariants(),
        isCollapsed && !isMobile && !isInSubmenu && "justify-center",
        "[&>svg]:ml-2",
        className,
      )}
      {...props}
    >
      {isHovered && hasSidebarSubMenu && !isInSubmenu && !isMobile ? (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleMenu();
          }}
          data-slot="sidebar-collapsible-button"
          data-sidebar="collapsible-button"
          type="button"
          radius="full"
          variant="ghost"
          size="1"
          className={cn("size-4 ml-1")}
        >
          <ChevronRight
            className={cn(
              open ? "rotate-90" : "rotate-0",
              "transition-transform duration-200",
            )}
          />
        </IconButton>
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
  const { isCollapsed, isMobile } = useSidebar();
  const { toggleMenu } = useSidebarMenu();

  if (isCollapsed && !isMobile) {
    return (
      <SidebarMenuSubContext value={{ isInSubmenu: true }}>
        <ul
          data-slot="sidebar-menu-sub"
          data-sidebar="menu-sub"
          className={cn("flex flex-col gap-3 w-full min-w-0", className)}
          {...props}
        />
      </SidebarMenuSubContext>
    );
  }

  return (
    <CollapsibleContent>
      <div className="flex flex-row gap-1 mx-1">
        <div
          onClick={toggleMenu}
          className="cursor-pointer ms-[8px] me-[2px] py-1.5"
        >
          <div className="border-l border-grayA-6 h-full ms-[10px] me-[4px]" />
        </div>

        <SidebarMenuSubContext value={{ isInSubmenu: true }}>
          <ul
            data-slot="sidebar-menu-sub"
            data-sidebar="menu-sub"
            className={cn(
              "flex flex-col gap-3 py-3 mr-2 w-full min-w-0",
              className,
            )}
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
  ComponentProps<typeof ModeToggle> &
    Omit<TooltipProps, "content"> & { content?: string }
> = ({ className, side = "right", ...props }) => {
  const { isCollapsed, isMobile } = useSidebar();
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

  if (isCollapsed && !isMobile) {
    return (
      <Tooltip side={side} content={content}>
        <ModeToggle
          data-sidebar="menu-toggle"
          data-slot="sidebar-menu-toggle"
          size="2"
          className={cn(
            "text-accent-11 w-full rounded-full justify-center",
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
      size="2"
      title={content}
      className={cn("w-full justify-start gap-2 [&>svg]:ml-2", className)}
      {...props}
    >
      {content}
    </ModeToggle>
  );
};

const SidebarMobile: FC<ComponentProps<"div">> = (props) => {
  const { toggleSidebar, isCollapsed } = useSidebar();

  return (
    <MainContent>
      <Drawer open={isCollapsed} onOpenChange={toggleSidebar} direction="left">
        <div className="sticky top-0 mx-1 mt-1">
          <DrawerTrigger asChild>
            <IconButton
              className="@max-[130px]:w-full @min-[130px]:min-w-9 @min-[130px]:max-w-9 [&_svg]:size-5"
              variant="soft"
              radius="full"
              size="2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSidebar();
              }}
            >
              <Menu />
            </IconButton>
          </DrawerTrigger>
        </div>
        <DrawerContent
          aria-describedby={undefined}
          className="bg-accent-1 left-0 top-0 bottom-0 border-r-2 border-grayA-6 max-w-[300px] w-full"
        >
          <VisuallyHidden>
            <DrawerTitle>
              Личный кабинет пользователя ТК "Наша Почта"
            </DrawerTitle>
          </VisuallyHidden>
          <div className="grow h-full w-full pt-1 flex flex-col" {...props} />
        </DrawerContent>
      </Drawer>
      <SidebarOutlet />
    </MainContent>
  );
};

const Sidebar: FC<ComponentProps<"div">> = (props) => {
  const {
    expandedSize,
    panelRef,
    minimalSize,
    collapsedSize,
    isMobile,
    handleResize,
  } = useSidebar();

  if (isMobile) {
    return <SidebarMobile {...props} />;
  }

  return (
    <Fragment>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          ref={panelRef}
          className="bg-accentA-1 has-[~[data-resize-handle-active]]:duration-100 transition-[flex]"
          collapsedSize={collapsedSize}
          collapsible
          defaultSize={expandedSize}
          maxSize={expandedSize}
          minSize={minimalSize}
          onResize={handleResize}
        >
          <div
            className="h-full @container flex flex-col overflow-y-auto min-h-screen"
            {...props}
          />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel>
          <MainContent>
            <SidebarOutlet />
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
