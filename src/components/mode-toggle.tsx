import { useTheme } from "@/hooks/theme";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { SunIcon, MoonIcon } from "lucide-react";

export const ModeToggle: FC = () => {
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
  if (theme === 'dark') {
    content = 'Изменить на светлую тему';
  } else if (theme === 'light') {
    content = 'Изменить на темную тему';
  } else {
    content = isDark ? "Изменить на светлую тему" : "Изменить на темную тему";
  }

  return (
    <Tooltip content={content}>
      <Button size="icon" onClick={handleToggle}>
        <Icon />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </Tooltip>
  );
};
