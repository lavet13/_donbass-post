import { useTheme } from "@/hooks/theme";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon } from "lucide-react";

export const ModeToggle: FC = () => {
  const { theme, setTheme } = useTheme();

  let Icon = null;
  if (theme === "light") {
    Icon = SunIcon;
  } else if (theme === "dark") {
    Icon = MoonIcon;
  } else {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    Icon = isDark ? MoonIcon : SunIcon;
  }

  const handleToggle = () => {
    let newTheme = theme;
    newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  return (
    <Button size="icon" onClick={handleToggle}>
      <Icon />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
