import type { ComponentProps, FC } from "react";
import { Suspense } from "react";
import { Spinner } from "@radix-ui/themes";

type SuspendProps = ComponentProps<typeof Suspense>;

export const Suspend: FC<SuspendProps> = ({ fallback, children, ...props }) => {
  return (
    <Suspense
      fallback={
        fallback || (
          <div className="col-span-full flex-1 flex items-center justify-center gap-2 my-1 text-accent-indicator">
            <Spinner />
            Загрузка...
          </div>
        )
      }
      {...props}
    >
      {children}
    </Suspense>
  );
};
