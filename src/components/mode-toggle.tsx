import { useTheme } from "@/hooks/use-theme";
import type { FC, MouseEvent } from "react";
import { SunIcon, MoonIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton, type IconButtonProps } from "@radix-ui/themes";

type ModeToggleProps = IconButtonProps;

export const ModeToggle: FC<ModeToggleProps> = ({
  className,
  onClick: onClickProp,
  children,
  ...props
}) => {
  const { theme, setTheme } = useTheme();

  let Icon = null;
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (theme === "light") {
    Icon = SunIcon;
  } else if (theme === "dark") {
    Icon = MoonIcon;
  } else {
    Icon = isDark ? MoonIcon : SunIcon;
  }

  const handleToggle = (e: MouseEvent<HTMLButtonElement>) => {
    let newTheme = theme;
    newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    onClickProp?.(e);
  };

  let content = "";
  if (theme === "dark") {
    content = "Изменить на светлую тему";
  } else if (theme === "light") {
    content = "Изменить на темную тему";
  } else {
    content = isDark ? "Изменить на светлую тему" : "Изменить на темную тему";
  }

  return (
    <IconButton
      className={cn("rounded-full [&>svg]:size-4 [&>svg]:shrink-0", className)}
      variant="ghost"
      onClick={handleToggle}
      {...props}
    >
      <Icon />
      {children ? (
        <span className="truncate">{children}</span>
      ) : (
        <span className="sr-only">{content}</span>
      )}
    </IconButton>
  );
};
