import { useAuth } from "@/hooks/use-auth";
import { Theme } from "@radix-ui/themes";
import { useTheme } from "@/hooks/use-theme";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/router";

export default function App() {
  const auth = useAuth();
  const { resolvedTheme } = useTheme();

  return (
    <Theme
      appearance={resolvedTheme}
      accentColor="red"
      grayColor="gray"
      panelBackground="solid"
    >
      <RouterProvider router={router} context={{ auth }} />
    </Theme>
  );
}
