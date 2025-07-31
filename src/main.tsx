import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import { RouterProvider } from "@tanstack/react-router";
import { createRouter } from "@/router.tsx";
import { useAuth } from "@/hooks/use-auth";

const router = createRouter();

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const auth = useAuth();
  console.log({ auth });
  return <RouterProvider router={router} context={{ auth }} />;
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
