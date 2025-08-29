import { useTheme } from "@/hooks/use-theme";
import type { ComponentProps, FC } from "react";
import { Tooltip } from "@/components/ui/tooltip";
import { SunIcon, MoonIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ModeToggleProps = ComponentProps<"button">;

export const ModeToggle: FC<ModeToggleProps> = ({ className, ...props }) => {
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

  const handleToggle = () => {
    let newTheme = theme;
    newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
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
    <Tooltip content={content}>
      <Button
        className={cn("rounded-full", className)}
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        {...props}
      >
        <Icon />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </Tooltip>
  );
};
