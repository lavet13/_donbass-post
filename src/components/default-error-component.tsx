import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { type ErrorRouteComponent } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button, Heading } from "@radix-ui/themes";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// @see documentation: https://tanstack.com/router/latest/docs/framework/react/guide/external-data-loading#error-handling-with-tanstack-query
export const DefaultErrorComponent: ErrorRouteComponent = ({ error }) => {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const queryErrorResetBoundary = useQueryErrorResetBoundary();

  useEffect(() => {
    queryErrorResetBoundary.reset();
  }, [queryErrorResetBoundary]);

  return (
    <main className="flex flex-col w-full max-w-6xl grow shrink-0 min-h-[calc(100svh-var(--header-height))]">
      <div className="flex-1 flex flex-col items-center justify-center">
        <Collapsible open={open} onOpenChange={setOpen}>
          <div
            style={{
              padding: "0.5rem",
              maxWidth: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Heading color="gray" as="h1" size="5">
                Что-то пошло не так!
              </Heading>
              <CollapsibleTrigger asChild>
                <Button color="gray" variant="outline" size="1" radius="full">
                  {open ? "Спрятать ошибку" : "Показать ошибку"}
                </Button>
              </CollapsibleTrigger>
            </div>
            <div
              style={{
                height: "0.25rem",
              }}
            ></div>
            <CollapsibleContent className="max-w-[350px]">
              <div>
                <pre
                  style={{
                    display: "inline-flex",
                    whiteSpace: "wrap",
                    fontSize: "0.7em",
                    padding: "0.3rem",
                    color: "var(--accent-a11)",
                    overflow: "auto",
                  }}
                >
                  <code>{error.message}</code>
                </pre>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
        <Button
          color="gray"
          variant="soft"
          onClick={() => {
            // Invalidate the route to reload the loader, and reset any router error boundaries
            router.invalidate();
          }}
        >
          Попробовать еще раз
        </Button>
      </div>
    </main>
  );
};
