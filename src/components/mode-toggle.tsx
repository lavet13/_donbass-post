import { useTheme } from "@/hooks/theme";
import type { FC } from "react";
import { Button } from "./ui/button";
import { SunIcon, MoonIcon } from 'lucide-react';

export const ModeToggle: FC = () => {
  const { theme, setTheme } = useTheme();

  let Icon = SunIcon;
  if (theme === 'light') {
    Icon = SunIcon;
  } else if (theme === 'dark') {
    Icon = MoonIcon;
  }

  const handleToggle = () => {
    let newTheme = theme;
    newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <Button onClick={handleToggle}>
      <Icon />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
