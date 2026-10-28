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

const rootElement = document.getElementById("root")!;

// Prerendered pages: download the route's code-split chunks BEFORE React replaces the
// markup, or #root goes blank until they arrive. Empty shell (dashboard, auth): render
// at once, so beforeLoad runs with `auth` from <App />, not before it exists.
// .then, not top-level await: the lazy chunks import from this entry chunk, which stays
// "still evaluating" until a top-level await settles, so they could never load (deadlock).
const ready = rootElement.hasChildNodes() ? router.load() : Promise.resolve();
// hasChildNodes(): true when #root contains anything, i.e. the prerendered markup
// Promise.resolve(): an already-settled promise, so .then runs right away
// void: we deliberately don't await or return this promise (and the lint rule knows it)
void ready.then(() => {
  // Swap the static head tags for the route's own (<HeadContent />) only now: removed
  // earlier, the tab would show no title while the chunks download.
  document.querySelectorAll("[data-static-head]").forEach((el) => el.remove());
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
