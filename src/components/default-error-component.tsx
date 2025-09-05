import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { type ErrorRouteComponent } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
    <main className="flex flex-col grow shrink-0 min-h-[calc(100svh-3.5rem)]">
      <div className="flex-1 flex flex-col items-center">
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
              <strong
                style={{
                  fontSize: "1rem",
                }}
              >
                Что-то пошло не так!
              </strong>
              <CollapsibleTrigger asChild>
                <button
                  style={{
                    appearance: "none",
                    fontSize: "0.6em",
                    border: "1px solid currentcolor",
                    padding: "0.1rem 0.2rem",
                    fontWeight: "bold",
                    borderRadius: "0.25rem",
                  }}
                >
                  {open ? "Спрятать ошибку" : "Показать ошибку"}
                </button>
              </CollapsibleTrigger>
            </div>
            <div
              style={{
                height: "0.25rem",
              }}
            ></div>
            <CollapsibleContent>
              <div>
                <pre
                  style={{
                    fontSize: "0.7em",
                    border: "1px solid red",
                    borderRadius: "0.25rem",
                    padding: "0.3rem",
                    color: "red",
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
