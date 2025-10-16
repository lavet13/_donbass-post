import { useState, type ComponentProps, type FC, type JSX } from "react";
import { Heading, Text } from "@radix-ui/themes";
import {
  Link,
  useLocation,
  type LinkOptions,
  type LinkProps,
} from "@tanstack/react-router";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { BorderBeam } from "../ui/border-beam";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

const ListItem: FC<LinkProps & ComponentProps<"a">> = ({
  className,
  to,
  children,
  ...props
}) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link className={cn("", className)} to={to} {...props}>
          <Text className="leading-rx-4" as="span" size="2">
            {children}
          </Text>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};

type NavItem = {
  label: string;
  triggerStyles?: string;
  icon: JSX.Element;
  items: readonly (LinkOptions & { label: any })[];
};

type MainNavProps = {
  navItems: NavItem[];
};

const MainNav: FC<MainNavProps> = ({ navItems }) => {
  const pathname = useLocation({ select: ({ pathname }) => pathname });

  const styles = getComputedStyle(document.documentElement);
  const sm = styles.getPropertyValue("--breakpoint-sm"); // 64rem
  const isMobile = useMediaQuery(`(max-width: ${sm})`);

  // https://codesandbox.io/p/sandbox/navigation-menu-track-position-forked-fx5dtd?file=%2Fsrc%2FApp.js%3A51%2C48-51%2C51
  const [value, setValue] = useState("");
  const [list, setList] = useState<HTMLUListElement | null>(null);
  const [offset, setOffset] = useState<number | null>(null);
  const onNodeUpdate = (trigger: any, itemValue: any) => {
    if (trigger && list && value === itemValue) {
      const listWidth = list.offsetWidth;
      const listCenter = listWidth / 2;

      const triggerOffsetRight =
        listWidth -
        trigger.offsetLeft -
        trigger.offsetWidth +
        trigger.offsetWidth / 2;

      setOffset(Math.round(listCenter - triggerOffsetRight));
    } else if (value === "") {
      setOffset(null);
    }
    return trigger;
  };

  return (
    <NavigationMenu
      delayDuration={0}
      skipDelayDuration={0}
      onValueChange={setValue}
    >
      <NavigationMenuList ref={setList}>
        {navItems.map(({ label, icon, items, triggerStyles }) => {
          return (
            <NavigationMenuItem key={label} value={label}>
              <NavigationMenuTrigger
                className={cn(
                  items.some(({ to }) => to && pathname.includes(to)) &&
                    "[&[data-state='open']]:bg-accentA-3 bg-accentA-2 [&>svg]:scale-110 [&>svg]:rotate-10",
                  triggerStyles,
                )}
                ref={(node) => onNodeUpdate(node, label)}
              >
                <>
                  {icon}
                  {items.some(({ to }) => to && pathname.includes(to)) && (
                    <BorderBeam />
                  )}
                </>
              </NavigationMenuTrigger>
              {!!items.length && (
                <NavigationMenuContent>
                  <div className="p-4">
                    <Heading
                      weight="bold"
                      className="px-3"
                      mb="1"
                      as="h3"
                      size="3"
                      wrap="balance"
                    >
                      {label}
                    </Heading>
                    <ul className="xs:w-[400px] m-0 grid w-[calc(100svw-4rem)] shrink-0 list-none gap-[10px] sm:w-[600px] sm:grid-cols-2">
                      {items.map(({ label, to }) => (
                        <ListItem key={to} to={to}>
                          {label}
                        </ListItem>
                      ))}
                    </ul>
                  </div>
                </NavigationMenuContent>
              )}
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>

      <NavigationMenuViewport
        style={{
          translate: `${isMobile ? 0 : offset}px 0`,
        }}
      />
    </NavigationMenu>
  );
};

export default MainNav;
