import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useEffect } from "react";

type Theme = "dark" | "light" | "system";

const themeAtom = atomWithStorage<Theme>("radix-ui-theme", "system");

// Helper function to resolve the effective theme
const resolveTheme = (theme: Theme): "dark" | "light" => {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
};

const useTheme = () => {
  const [theme, setTheme] = useAtom(themeAtom);

  useEffect(() => {
    // This effect handles applying classes and colorScheme to the root element
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    const resolvedTheme = resolveTheme(theme); // Resolve the theme

    root.classList.add(resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  }, [theme]);

  // Return the resolved theme along with the original theme and setter
  const resolvedTheme = resolveTheme(theme);

  return { theme, setTheme, resolvedTheme };
};

export { useTheme, themeAtom, type Theme, resolveTheme }; // Export resolveTheme if needed elsewhere
