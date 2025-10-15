import {
  Link,
  linkOptions,
  useLocation,
  type LinkProps,
} from "@tanstack/react-router";
import { useState, type ComponentProps, type FC } from "react";
import { Heading, IconButton, Text, Tooltip } from "@radix-ui/themes";
// import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { HandbagIcon, Menu, Package } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
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
        <Link className="text-accent-12 hover:bg-accent-3" to={to} {...props}>
          <Text className="leading-rx-4" as="span" size="2">
            {children}
          </Text>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};

export const Header: FC = () => {
  const pathname = useLocation({ select: ({ pathname }) => pathname });
  // const { isAuthenticated } = useAuth();
  let content = "";
  const { theme } = useTheme();
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (theme === "dark") {
    content = "Изменить на светлую тему";
  } else if (theme === "light") {
    content = "Изменить на темную тему";
  } else {
    content = isDark ? "Изменить на светлую тему" : "Изменить на темную тему";
  }

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

  const navItems = [
    {
      label: "Грузы и посылки",
      triggerStyles: "py-2.5 px-4.5",
      icon: <Package />,
      items: linkOptions([
        {
          label: "Адресный забор/доставка груза в ЛДНР и Запорожье",
          to: "/pick-up-point-delivery-order",
        },
      ]),
    },
    {
      label: "Интернет заказы",
      triggerStyles: "py-2.5 px-4.5",
      icon: <HandbagIcon />,
      items: linkOptions([
        {
          label: "Оформление заявки на просчет стоимости на выкуп заказов",
          to: "/shop-cost-calculation-order",
        },
      ]),
    },
  ];

  return (
    <header className="sticky top-0 w-full h-14 z-10 flex bg-background dark:bg-grayA-2 dark:backdrop-blur-lg border-b border-grayA-6">
      <div className="flex items-center w-full px-3.5">
        <div className="relative h-full w-full flex justify-between items-center">
          <div className="flex-none flex gap-3 items-center">
            <Tooltip content="Меню">
              <IconButton
                size="3"
                radius="full"
                className="[&_svg]:size-4"
                variant="ghost"
              >
                <Menu />
              </IconButton>
            </Tooltip>
            <Link
              className="select-none hidden md:block data-[status=active]:animate-[glow_10s_ease-in-out_infinite]"
              to="/"
              activeOptions={{ exact: true }}
            >
              <img
                className="w-[220px] h-full"
                src={`${import.meta.env.BASE_URL}/logomini_np-bsd.png`}
                alt={`Лого "Наша Почта - почта по-новому" Партнер "БСД"`}
              />
            </Link>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex-1 shrink-0 flex items-center justify-center">
            <NavigationMenu
              delayDuration={0}
              skipDelayDuration={0}
              onValueChange={setValue}
            >
              <NavigationMenuList ref={setList}>
                {navItems.map(({ label, icon, items, triggerStyles }) => (
                  <NavigationMenuItem key={label} value={label}>
                    <NavigationMenuTrigger
                      className={cn(
                        items.some(({ to }) => pathname.includes(to)) &&
                          "[&[data-state='open']]:bg-accentA-3 [box-shadow:inset_0_0_0_1px_var(--accent-a11)] [&>svg]:rotate-10",
                        triggerStyles,
                      )}
                      ref={(node) => onNodeUpdate(node, label)}
                    >
                      {icon}
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
                          <ul className="grid m-0 gap-[10px] list-none shrink-0 w-[calc(100svw-4rem)] xs:w-[400px] sm:w-[600px] sm:grid-cols-2">
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
                ))}
              </NavigationMenuList>

              <NavigationMenuViewport
                style={{
                  translate: `${isMobile ? 0 : offset}px 0`,
                }}
              />
            </NavigationMenu>
          </div>
          <div className="flex-none flex items-center justify-end">
            <Tooltip content={content}>
              <ModeToggle size="3" />
            </Tooltip>
          </div>
        </div>
      </div>
    </header>
  );
};
{
  /* <div className="flex items-center gap-4.5"> */
}
{
  /*   <NavButton to="/" activeOptions={{ exact: true }}> */
}
{
  /*     Главная */
}
{
  /*   </NavButton> */
}
{
  /*   <NavButton to="/shop-cost-calculation-order"> */
}
{
  /*     Выкуп менеджером ИМ */
}
{
  /*   </NavButton> */
}
{
  /*   <NavButton to="/pick-up-point-delivery-order">Забор груза</NavButton> */
}
{
  /*   <NavButton to="/schedules">Расписание</NavButton> */
}
{
  /* </div> */
}
{
  /* <div className="ml-auto flex items-center gap-2.5"> */
}
{
  /*   <Tooltip content={content}> */
}
{
  /*     <ModeToggle /> */
}
{
  /*   </Tooltip> */
}
{
  /*   {!isAuthenticated ? ( */
}
{
  /*     <Button variant="classic" asChild> */
}
{
  /*       <Link to="/auth">Личный кабинет</Link> */
}
{
  /*     </Button> */
}
{
  /*   ) : ( */
}
{
  /*     <Button variant="classic" asChild> */
}
{
  /*       <Link to="/dashboard">Мой кабинет</Link> */
}
{
  /*     </Button> */
}
{
  /*   )} */
}
{
  /* </div> */
}

{
  /* <Button className="ml-auto" onClick={logout}>Выйти</Button> */
}
