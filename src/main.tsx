import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/router";
import { useAuth } from "@/hooks/use-auth";
import { Theme } from "@radix-ui/themes";
import "./styles.css";
import { useTheme } from "@/hooks/use-theme";

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const auth = useAuth();
  const { resolvedTheme } = useTheme();

  return (
    <Theme
      appearance={resolvedTheme}
      accentColor="red"
      grayColor="gray"
      panelBackground="translucent"
    >
      <RouterProvider router={router} context={{ auth }} />
    </Theme>
  );
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
