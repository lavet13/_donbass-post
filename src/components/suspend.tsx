import { Loader } from "lucide-react";
import type { ComponentProps, FC } from "react";
import { Suspense } from "react";

type SuspendProps = ComponentProps<typeof Suspense>;

export const Suspend: FC<SuspendProps> = ({ fallback, children, ...props }) => {
  return (
    <Suspense
      fallback={
        fallback || (
          <div className="flex items-center justify-center">
            <Loader className="animate-spin size-5" />
          </div>
        )
      }
      {...props}
    >
      {children}
    </Suspense>
  );
};
