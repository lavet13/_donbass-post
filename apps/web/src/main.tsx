import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "@/styles.css";
import { router } from "@/router";
import App from "@/App";

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// The route's <HeadContent /> renders its own title/description; drop the static
// defaults first, or document.title keeps reading the first <title> in the page.
document.querySelectorAll("[data-static-head]").forEach((el) => el.remove());

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
