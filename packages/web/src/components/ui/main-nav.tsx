import {
  Fragment,
  useState,
  type ComponentProps,
  type FC,
  type JSX,
} from "react";
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
  items:
    | {
        title?: string;
        links: readonly (LinkOptions & { label: string })[];
      }[]
    | readonly (LinkOptions & { label: string })[];
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
          if (items.length > 0 && "links" in items[0]) {
            const grouped = items as {
              title?: string;
              links: readonly (LinkOptions & { label: string })[];
            }[];

            return (
              <NavigationMenuItem key={label} value={label}>
                <NavigationMenuTrigger
                  className={cn(
                    grouped.some(({ links }) =>
                      links.some(
                        (link) => link.to && pathname.includes(link.to),
                      ),
                    ) &&
                      "[&[data-state='open']]:bg-accentA-3 bg-accentA-2 [&>svg]:scale-110 [&>svg]:rotate-10",
                    triggerStyles,
                  )}
                  ref={(node) => onNodeUpdate(node, label)}
                >
                  <>
                    {icon}
                    {grouped.some(({ links }) =>
                      links.some(
                        (link) => link.to && pathname.includes(link.to),
                      ),
                    ) && <BorderBeam />}
                  </>
                </NavigationMenuTrigger>
                {!!items.length && (
                  <NavigationMenuContent>
                    <div className="relative pt-3">
                      <Heading
                        weight="bold"
                        className="dark:bg-gray-2 bg-background sticky top-0 mb-1 px-7 pt-2 backdrop-blur-sm"
                        mb="1"
                        as="h3"
                        size="3"
                        wrap="balance"
                      >
                        {label}
                      </Heading>
                      <ul className="xs:w-[400px] m-0 grid w-[calc(100dvw-1.5rem)] shrink-0 list-none gap-x-[10px] gap-y-[4px] px-4 pb-4 sm:w-[600px] sm:grid-cols-2">
                        {grouped.map(({ title, links }) => (
                          <Fragment key={title}>
                            {title && (
                              <Heading
                                mt="2"
                                className="dark:bg-gray-2 bg-background sticky top-7.5 col-span-full pl-3"
                                as="h4"
                                size="1"
                                wrap="balance"
                                trim="start"
                              >
                                {title}
                              </Heading>
                            )}
                            {links.map(({ to, label }) => (
                              <ListItem key={to} to={to}>
                                {label}
                              </ListItem>
                            ))}
                          </Fragment>
                        ))}
                      </ul>
                    </div>
                  </NavigationMenuContent>
                )}
              </NavigationMenuItem>
            );
          } else {
            const flat = items as readonly (LinkOptions & { label: string })[];

            return (
              <NavigationMenuItem key={label} value={label}>
                <NavigationMenuTrigger
                  className={cn(
                    flat.some(({ to }) => to && pathname.includes(to)) &&
                      "[&[data-state='open']]:bg-accentA-3 bg-accentA-2 [&>svg]:scale-110 [&>svg]:rotate-10",
                    triggerStyles,
                  )}
                  ref={(node) => onNodeUpdate(node, label)}
                >
                  <>
                    {icon}
                    {flat.some(({ to }) => to && pathname.includes(to)) && (
                      <BorderBeam />
                    )}
                  </>
                </NavigationMenuTrigger>
                {!!items.length && (
                  <NavigationMenuContent>
                    <div className="relative pt-3">
                      <Heading
                        weight="bold"
                        className="dark:bg-gray-2 bg-background sticky top-0 mb-1 px-7 pt-2 backdrop-blur-sm"
                        mb="1"
                        as="h3"
                        size="3"
                        wrap="balance"
                      >
                        {label}
                      </Heading>
                      <ul className="xs:w-[400px] m-0 grid w-[calc(100dvw-1.5rem)] shrink-0 list-none gap-x-[10px] gap-y-[4px] px-4 pb-4 sm:w-[600px] sm:grid-cols-2">
                        {flat.map(({ to, label }) => (
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
          }
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
