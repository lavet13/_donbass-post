import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { type ErrorRouteComponent } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export const DefaultErrorComponent: ErrorRouteComponent = ({ error }) => {
  const router = useRouter();
  const queryErrorResetBoundary = useQueryErrorResetBoundary();

  useEffect(() => {
    queryErrorResetBoundary.reset();
  }, [queryErrorResetBoundary]);

  return (
    <div className="flex flex-col items-center">
      <span>Произошла ошибка!</span>
      <br />
      <span>Сообщение об ошибке: {error.message}</span>
      <Button
        onClick={async () => {
          // Invalidate the route to reload the loader, and reset any router error boundaries
          await router.invalidate();
        }}
      >
        Попробовать еще раз
      </Button>
    </div>
  );
};
