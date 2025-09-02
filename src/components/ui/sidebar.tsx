import { useContainerQuery } from "@/hooks/use-container-query";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import {
  createContext,
  Fragment,
  useContext,
  useMemo,
  useRef,
  type ComponentProps,
  type FC,
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
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Outlet } from "@tanstack/react-router";
import { ModeToggle } from "../mode-toggle";
import { useTheme } from "@/hooks/use-theme";

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

  const contextValue = useMemo<SidebarContextProps>(
    () => ({
      expandedSize: expandedSizePercent,
      collapsedSize: collapsedSizePercent,
      minimalSize: minimalSizePercent,
      panelRef,
      isCollapsed,
      containerRef,
      isMobile,
      toggleSidebar,
    }),
    [
      expandedSizePercent,
      collapsedSizePercent,
      minimalSizePercent,
      panelRef.current,
      isCollapsed,
      containerRef.current,
      isMobile,
      toggleSidebar,
    ],
  );

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
      className={cn(
        "flex w-full min-w-0 flex-col cursor-default gap-px",
        className,
      )}
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
          className={cn("w-full rounded-lg", className)}
          {...props}
        />
      </Tooltip>
    );
  }

  return (
    <ModeToggle
      title={content}
      className={cn("w-full rounded-lg", className)}
      {...props}
    >
      {content}
    </ModeToggle>
  );
};

const SidebarMenuButton: FC<
  ComponentProps<typeof Button> & ComponentProps<typeof Tooltip>
> = ({ className, content, side = "right", ...props }) => {
  const { isCollapsed } = useSidebar();

  if (isCollapsed) {
    return (
      <Tooltip side={side} content={content}>
        <Button
          className={cn("w-full rounded-lg", className)}
          {...props}
        />
      </Tooltip>
    );
  }

  return (
    <Button
      title={content}
      className={cn("w-full rounded-lg", className)}
      {...props}
    />
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
  useSidebar,
};
