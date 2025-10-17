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
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type FC,
} from "react";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { isMobile as isMobileDevice } from "react-device-detect";
import { cn } from "@/lib/utils";
import { atom, useAtom } from "jotai";
import { BorderBeam } from "./border-beam";

const toggleMenuAtom = atom(false);

const MainSidebar: FC<ComponentProps<"div">> = (props) => {
  const [open, setOpen] = useAtom(toggleMenuAtom);

  const styles = getComputedStyle(document.documentElement);
  const middleBreakpoint = styles.getPropertyValue("--breakpoint-md");
  const isMobile =
    useMediaQuery(`(max-width: calc(${middleBreakpoint} - 1px))`) ||
    isMobileDevice;

  return (
    <>
      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen} direction="left">
          <Tooltip content="Меню">
            <DrawerTrigger asChild>
              <Trigger />
            </DrawerTrigger>
          </Tooltip>
          <DrawerContent
            aria-describedby={undefined}
            className="bg-gray-2 top-0 bottom-0 left-0 w-full max-w-[300px]"
          >
            <VisuallyHidden>
              <DrawerTitle>Боковое меню</DrawerTitle>
            </VisuallyHidden>
            <div className="flex grow flex-col" {...props} />
          </DrawerContent>
        </Drawer>
      ) : null}
      <Logo className="hidden md:block" />
    </>
  );
};

const Logo: FC<ComponentProps<typeof Link>> = ({ className, ...props }) => {
  return (
    <Link
      className={cn("relative select-none", className)}
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

type TriggerProps = ComponentProps<typeof IconButton> & {
  Icon?: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  iconProps?: ComponentProps<
    React.ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >
  >;
};

const Trigger: FC<TriggerProps> = ({
  Icon = Menu,
  iconProps,
  ...triggerProps
}) => {
  return (
    <IconButton size="3" radius="full" variant="ghost" {...triggerProps}>
      <Icon size={18} {...iconProps} />
    </IconButton>
  );
};

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

const MainSidebarButton: FC<MainSidebarButtonProps> = ({
  className,
  Icon,
  iconProps,
  ...props
}) => {
  const [, setOpen] = useAtom(toggleMenuAtom);
  const handleToggle = () => setOpen((prev) => !prev);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isActive, setIsActive] = useState(false);

  const updateActive = () => {
    if (!buttonRef.current) return null;

    const isActive = buttonRef.current.getAttribute("data-status") === "active";
    setIsActive(isActive);
  };

  useEffect(() => {
    const mutationObserver = new MutationObserver(updateActive);

    if (buttonRef.current) {
      mutationObserver.observe(buttonRef.current, {
        subtree: true,
        attributeFilter: ["data-status"],
      });
    }

    updateActive();

    return () => {
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <Button
      ref={buttonRef}
      onClick={handleToggle}
      radius="full"
      variant="ghost"
      size="3"
      className={cn(
        "data-[status=active]:bg-accentA-4 relative -mx-3 w-full items-center justify-start gap-1.5 px-3 [&>svg]:size-4.5 [&>svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {Icon && <Icon {...iconProps} />}
      <Slottable>{props.children}</Slottable>
      {isActive && <BorderBeam />}
    </Button>
  );
};

const MainSidebarHeader: FC<ComponentProps<"div">> = (props) => {
  const [, setOpen] = useAtom(toggleMenuAtom);

  const handleToggle = () => setOpen((prev) => !prev);

  return (
    <div
      className="sticky top-0 z-0 flex min-w-0 items-center gap-3 px-3.5 pt-4 pb-2"
      {...props}
    >
      <Trigger iconProps={{ size: 20 }} Icon={X} onClick={handleToggle} />
      <Logo onClick={handleToggle} />
    </div>
  );
};

const MainSidebarFooter: FC<ComponentProps<"div">> = (props) => {
  return (
    <div
      className="sticky bottom-0 z-0 mx-1 mt-2 mb-1 flex flex-col justify-center gap-4 px-3.5 pt-4 pb-2"
      {...props}
    />
  );
};

const MainSidebarContent: FC<ComponentProps<typeof ScrollArea>> = ({
  children,
  ...props
}) => {
  return (
    <ScrollArea scrollbars="vertical" {...props}>
      <div className="flex min-h-0 flex-1 flex-col items-start gap-3 px-4.5 pt-2">
        {children}
      </div>
    </ScrollArea>
  );
};

export {
  MainSidebar,
  MainSidebarHeader,
  MainSidebarContent,
  MainSidebarFooter,
  MainSidebarButton,
};
