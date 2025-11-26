import {
  Button,
  IconButton,
  ScrollArea,
  Slottable,
  Tooltip,
  VisuallyHidden,
} from "@radix-ui/themes";
import { Link } from "@tanstack/react-router";
import { Menu, X, type LucideProps } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type FC,
  type ReactNode,
} from "react";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { isMobile as isMobileDevice } from "react-device-detect";
import { cn, composeEventHandlers } from "@/lib/utils";
import { BorderBeam } from "@/components/ui/border-beam";
import { createContext } from "@/hooks/create-context";
import { useControllableState } from "@/hooks/use-controllable-state";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { Portal as PortalPrimitive } from "@radix-ui/react-portal";
import { Presence } from "@radix-ui/react-presence";
import { useAtom, useAtomValue } from "jotai";
import {
  mainSidebarAtom,
  sidebarOpenAtom,
} from "@/components/ui/main-sidebar/atom";

const MAIN_SIDEBAR_NAME = "MainSidebar";

type MainSidebarContextValue = {
  open: boolean;
  onOpenChange(open: boolean): void;
  onOpenToggle(): void;
  isMobile: boolean;
  isTablet: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
};
const [MainSidebarProvider, useMainSidebarContext] =
  createContext<MainSidebarContextValue>(MAIN_SIDEBAR_NAME);

type MainSidebarProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
  children?: ReactNode;
};

const MainSidebar: FC<MainSidebarProps> = (props) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { open: openProp, onOpenChange, defaultOpen, children } = props;
  const styles = getComputedStyle(document.documentElement);
  const middleBreakpoint = styles.getPropertyValue("--breakpoint-md");
  const isMobile =
    useMediaQuery(`(max-width: calc(${middleBreakpoint} - 1px))`) ||
    isMobileDevice;

  const largeBreakpoint = styles.getPropertyValue("--breakpoint-lg");
  const isTablet = useMediaQuery(`(max-width: ${largeBreakpoint})`);

  const [cookieState, setCookieState] = useAtom(sidebarOpenAtom);

  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: (open) => {
      onOpenChange?.(open);
      setCookieState(open ? "open" : "closed");
    },
    caller: MAIN_SIDEBAR_NAME,
  });

  useEffect(() => {
    if (!isMobile) {
      setOpen(cookieState === "open" ? true : false);
    }
    // eslint-disable-next-line
  }, []);

  const handleToggle = useCallback(
    () => setOpen((prevOpen) => !prevOpen),
    [setOpen],
  );

  const withProvider = useCallback(
    (children?: ReactNode) => (
      <MainSidebarProvider
        triggerRef={triggerRef}
        contentRef={contentRef}
        open={open}
        onOpenChange={setOpen}
        onOpenToggle={handleToggle}
        isMobile={isMobile}
        isTablet={isTablet}
      >
        {children}
      </MainSidebarProvider>
    ),
    [handleToggle, isMobile, open, setOpen, isTablet],
  );

  if (isMobile) {
    return withProvider(<MainSidebarMobile>{children}</MainSidebarMobile>);
  }

  return withProvider(<MainSidebarDesktop>{children}</MainSidebarDesktop>);
};
MainSidebar.displayName = MAIN_SIDEBAR_NAME;

const MAIN_SIDEBAR_MOBILE_NAME = "MainSidebarMobile";
const MainSidebarMobile: FC<ComponentProps<"div">> = (props) => {
  const { children, ...sidebarProps } = props;
  const context = useMainSidebarContext(MAIN_SIDEBAR_MOBILE_NAME);

  return (
    <Drawer
      open={context.open}
      onOpenChange={context.onOpenChange}
      direction="left"
    >
      <DrawerTrigger asChild>
        <MainSidebarTrigger />
      </DrawerTrigger>
      <DrawerContent
        aria-describedby={undefined}
        className="bg-gray-2 top-0 bottom-0 left-0 w-full max-w-[300px]"
      >
        <VisuallyHidden>
          <DrawerTitle>Боковое меню(сайдбар)</DrawerTitle>
        </VisuallyHidden>
        <div className="flex min-h-0 grow flex-col" {...sidebarProps}>
          <MainSidebarHeader>
            <MainSidebarTrigger />
            <MainSidebarLogo />
          </MainSidebarHeader>
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
MainSidebarMobile.displayName = MAIN_SIDEBAR_MOBILE_NAME;

const MAIN_SIDEBAR_DESKTOP_NAME = "MainSidebarDesktop";
const MainSidebarDesktop: FC<ComponentProps<"div">> = (props) => {
  const { children, ...sidebarProps } = props;
  const container = useAtomValue(mainSidebarAtom);

  return (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <MainSidebarTrigger />
        <MainSidebarLogo />
      </div>
      <MainSidebarPortal container={container}>
        <div
          className="flex flex-1 flex-col"
          data-slot="main-sidebar"
          data-is-root-theme="true"
          data-accent-color="red"
          data-gray-color="gray"
          data-has-background="true"
          data-panel-background="translucent"
          data-radius="medium"
          data-scaling="100%"
          {...sidebarProps}
        >
          {children}
        </div>
      </MainSidebarPortal>
    </>
  );
};
MainSidebarDesktop.displayName = MAIN_SIDEBAR_DESKTOP_NAME;

type TriggerProps = ComponentProps<typeof IconButton> & {
  Icon?: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  iconProps?: ComponentProps<
    React.ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >
  >;
  showTooltip?: boolean;
  shouldFocusOnMount?: boolean;
};

const MAIN_SIDEBAR_TRIGGER = "MainSidebarTrigger";
const MainSidebarTrigger: FC<TriggerProps> = ({
  Icon,
  ref,
  iconProps,
  content,
  showTooltip = false,
  shouldFocusOnMount = false,
  ...triggerProps
}) => {
  const context = useMainSidebarContext(MAIN_SIDEBAR_TRIGGER);
  const composedRefs = useComposedRefs(ref, context.triggerRef);
  Icon = Icon || (context.open ? X : Menu);
  shouldFocusOnMount = shouldFocusOnMount || context.open;

  useEffect(() => {
    const button = context.triggerRef.current;
    if (!shouldFocusOnMount || !button) return;

    button.focus();

    return () => {
      button.blur();
    };
  }, [shouldFocusOnMount, context.triggerRef]);

  const trigger = (
    <IconButton
      size="3"
      radius="full"
      variant="ghost"
      ref={composedRefs}
      onClick={composeEventHandlers(triggerProps.onClick, context.onOpenToggle)}
      {...triggerProps}
    >
      <Icon size={18} {...iconProps} />
    </IconButton>
  );

  if (!showTooltip) {
    return trigger;
  }

  return <Tooltip content={content}>{trigger}</Tooltip>;
};
MainSidebarTrigger.displayName = MAIN_SIDEBAR_TRIGGER;

type MainSidebarButtonProps = ComponentProps<typeof Button> & {
  Icon?: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  iconProps?: ComponentProps<
    React.ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >
  >;
};

const MAIN_SIDEBAR_BUTTON_NAME = "MainSidebarButton";
const MainSidebarButton: FC<MainSidebarButtonProps> = ({
  className,
  Icon,
  iconProps,
  ref,
  ...props
}) => {
  const context = useMainSidebarContext(MAIN_SIDEBAR_BUTTON_NAME);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const composedRefs = useComposedRefs(ref, buttonRef);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const updateActive = () => {
      setIsActive(button.getAttribute("data-status") === "active");
    };

    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type.includes("attribute") &&
          mutation.attributeName === "data-status"
        ) {
          updateActive();
          break;
        }
      }
    });

    mutationObserver.observe(button, {
      attributeFilter: ["data-status"],
    });

    updateActive(); // Initial check

    return () => {
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <Button
      radius="full"
      variant="ghost"
      size="3"
      className={cn(
        "data-[status=active]:bg-accentA-4 relative -mx-3 w-full items-center justify-start gap-1.5 px-3 [&>svg]:size-4.5 [&>svg]:shrink-0",
        context.isTablet &&
          !context.isMobile &&
          "-mx-2 flex-col rounded-xl px-2 text-[10px]/1 font-bold",
        className,
      )}
      ref={composedRefs}
      onClick={composeEventHandlers(
        props.onClick,
        context.isMobile ? context.onOpenToggle : undefined,
      )}
      {...props}
    >
      {Icon && (
        <Icon {...iconProps} />
      )}
      <Slottable>{props.children}</Slottable>
      {isActive && <BorderBeam />}
    </Button>
  );
};
MainSidebarButton.displayName = MAIN_SIDEBAR_BUTTON_NAME;

const MAIN_SIDEBAR_HEADER_NAME = "MainSidebarHeader";
const MainSidebarHeader: FC<ComponentProps<"div">> = (props) => {
  return (
    <div
      className="sticky top-0 z-0 flex min-w-0 items-center gap-3 px-3.5 pt-4 pb-2"
      {...props}
    />
  );
};
MainSidebarHeader.displayName = MAIN_SIDEBAR_HEADER_NAME;

const MAIN_SIDEBAR_LOGO_NAME = "MainSidebarLogo";
const MainSidebarLogo: FC<ComponentProps<typeof Logo>> = (props) => {
  const context = useMainSidebarContext(MAIN_SIDEBAR_LOGO_NAME);

  return (
    <Logo
      onClick={composeEventHandlers(
        props.onClick,
        context.isMobile ? context.onOpenToggle : undefined,
      )}
      {...props}
    />
  );
};
MainSidebarLogo.displayName = MAIN_SIDEBAR_LOGO_NAME;

const MAIN_SIDEBAR_FOOTER_NAME = "MainSidebarFooter";
const MainSidebarFooter: FC<ComponentProps<"div">> = (props) => {
  return (
    <div
      className="sticky bottom-0 z-0 mx-1 mt-1 mb-1 flex min-h-0 shrink-0 flex-col justify-center gap-4 px-3.5 pt-4 pb-2"
      {...props}
    />
  );
};
MainSidebarFooter.displayName = MAIN_SIDEBAR_FOOTER_NAME;

const MAIN_SIDEBAR_PORTAL_NAME = "MainSidebarPortal";

type PortalProps = ComponentPropsWithoutRef<typeof PortalPrimitive>;
type MainSidebarPortalProps = PortalProps & {
  children?: ReactNode;
  /**
   * Specify a container element to portal the content into.
   */
  container?: PortalProps["container"];
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true;
};

const MainSidebarPortal: FC<MainSidebarPortalProps> = (props) => {
  const { container, children, forceMount } = props;
  const context = useMainSidebarContext(MAIN_SIDEBAR_PORTAL_NAME);

  if (context.isMobile) {
    return null;
  }

  return (
    <Presence present={forceMount || context.open}>
      <PortalPrimitive asChild container={container}>
        {children}
      </PortalPrimitive>
    </Presence>
  );
};
MainSidebarPortal.displayName = MAIN_SIDEBAR_PORTAL_NAME;

const MAIN_SIDEBAR_CONTENT_NAME = "MainSidebarContent";
const MainSidebarContent: FC<ComponentProps<typeof ScrollArea>> = ({
  children,
  ref,
  ...props
}) => {
  const context = useMainSidebarContext(MAIN_SIDEBAR_CONTENT_NAME);
  const composedRefs = useComposedRefs(ref, context.contentRef);

  return (
    <ScrollArea
      className="min-h-0"
      scrollbars="vertical"
      ref={composedRefs}
      {...props}
    >
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col items-start gap-3.5 px-4.5 pt-2",
          context.isTablet && !context.isMobile && "px-2.5",
        )}
      >
        {children}
      </div>
    </ScrollArea>
  );
};
MainSidebarContent.displayName = MAIN_SIDEBAR_CONTENT_NAME;

const Logo: FC<ComponentProps<typeof Link>> = ({ className, ...props }) => {
  return (
    <Link
      className={cn(
        "focus-visible:outline-accent-8 relative rounded-sm select-none focus-visible:outline-[2px] focus-visible:-outline-offset-1",
        className,
      )}
      to="/"
      activeOptions={{ exact: true }}
      {...props}
    >
      <img
        className="h-full w-[220px]"
        src={`${import.meta.env.BASE_URL}/logomini_np-bsd.png`}
        alt={`Лого "Наша Почта - почта по-новому" Партнер "БСД"`}
      />
    </Link>
  );
};

export {
  MainSidebar,
  MainSidebarHeader,
  MainSidebarContent,
  MainSidebarFooter,
  MainSidebarButton,
  MainSidebarLogo,
  MainSidebarTrigger,
};
