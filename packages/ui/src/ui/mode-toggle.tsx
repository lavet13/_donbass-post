import { useTheme } from "../hooks/use-theme";
import type { FC, MouseEvent } from "react";
import { SunIcon, MoonIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { IconButton, type IconButtonProps } from "@radix-ui/themes";

type ModeToggleProps = IconButtonProps;

export const ModeToggle: FC<ModeToggleProps> = ({
  className,
  onClick: onClickProp,
  children,
  ...props
}) => {
  // resolvedTheme already folds "system" into light/dark (and is safe to call during prerender)
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const Icon = isDark ? MoonIcon : SunIcon;

  const handleToggle = (e: MouseEvent<HTMLButtonElement>) => {
    let newTheme = theme;
    newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    onClickProp?.(e);
  };

  const content = isDark ? "Изменить на светлую тему" : "Изменить на темную тему";

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
