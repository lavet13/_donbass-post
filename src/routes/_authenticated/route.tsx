import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import {
  createFileRoute,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
  beforeLoad({ context, location }) {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/auth",
        search: {
          redirect: location.href,
        },
        replace: true,
      });
    }
  },
});

function AuthenticatedLayout() {
  return (
    <SidebarProvider>
      <Sidebar></Sidebar>
    </SidebarProvider>
  );
}

// @TODO: add persistence! link: https://github.com/bvaughn/react-resizable-panels/blob/main/packages/react-resizable-panels-website/src/routes/examples/ExternalPersistence.tsx
/*
    const sidebarStorageItem = localStorage.getItem(
      "react-resizable-panels:sidebar",
    );

    if (sidebarStorageItem) {
      const sidebarPersister = JSON.parse(sidebarStorageItem);

      const sidebarValues = Object.keys(sidebarPersister).map((sidebarValue) => {
        sidebarValue = sidebarValue.replace(/[{}]/g, "");
        const matchedValues = sidebarValue.match(/(.+?):(.+?)(?=,)/g)!;
        const result = [];

        for (const matchedValue of matchedValues) {
          const key = matchedValue.match(/\"(.*?)\"/)![1];
          let value = matchedValue.match(/\:(.*)/)![1];

          // @ts-ignore
          if (!isNaN(value)) {
            // @ts-ignore
            value = Number.parseFloat(value);
          } else if (value.includes("true")) {
            // @ts-ignore
            value = true;
          } else if (value.includes("false")) {
            // @ts-ignore
            value = false;
          }

          result.push([key, value]);
        }

        return Object.fromEntries(result);
      });

      console.log({ sidebarValues });
    }
  */
