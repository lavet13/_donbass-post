import { type ComponentProps, type FC } from "react";
import { useNProgress } from "@tanem/react-nprogress";
import { useRouterState } from "@tanstack/react-router";

const Bar: FC<
  ComponentProps<"div"> & {
    animationDuration: number;
    progress: number;
    isFinished: boolean;
  }
> = ({ animationDuration, progress, isFinished }) => {
  return (
    <>
      {/* Background bar */}
      <div
        style={{
          background: "var(--gray-7)", // Semi-transparent background
          height: 2,
          left: 0,
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 1030,
        }}
      />

      {/* Progress bar */}
      <div
        style={{
          background: "var(--red-9)",
          height: 2,
          left: 0,
          marginLeft: isFinished ? `-100%` : `${(-1 + progress) * 100}%`,
          position: "fixed",
          top: 0,
          transition: `margin-left ${animationDuration}ms ease-out`,
          width: "100%",
          zIndex: 1031,
        }}
      >
        <div
          style={{
            boxShadow: "0 0 10px var(--red-9), 0 0 5px var(--red-10)",
            display: "block",
            height: "100%",
            opacity: 1,
            position: "absolute",
            right: 0,
            transform: "rotate(3deg) translate(0px, -4px)",
            width: 100,
          }}
        />
      </div>
    </>
  );
};

const Container: FC<
  ComponentProps<"div"> & {
    animationDuration: number;
    isFinished: boolean;
  }
> = ({ animationDuration, children, isFinished }) => (
  <div
    style={{
      visibility: isFinished ? "hidden" : "visible",
      opacity: isFinished ? 0 : 1,
      pointerEvents: "none",
      transition: `opacity ${animationDuration}ms linear`,
    }}
  >
    {children}
  </div>
);

type UseNProgressProps = Parameters<typeof useNProgress>[0];

const Progress: FC<UseNProgressProps> = (props) => {
  const {
    animationDuration = 200,
    minimum = 0.08,
    incrementDuration = 800,
    isAnimating = false,
  } = props || {};

  const { isFinished, progress } = useNProgress({
    isAnimating,
    minimum,
    animationDuration,
    incrementDuration,
  });

  return (
    <Container animationDuration={animationDuration} isFinished={isFinished}>
      <Bar
        animationDuration={animationDuration}
        progress={progress}
        isFinished={isFinished}
      />
    </Container>
  );
};

const NProgress: FC = () => {
  const routerState = useRouterState({
    select: ({ resolvedLocation, location, status }) => ({
      resolvedLocation,
      location,
      status,
    }),
  });

  const pathname = routerState.location.pathname;
  const resolvedPathname = routerState.resolvedLocation?.pathname;
  const isAnimating =
    routerState.status === "pending" && pathname !== resolvedPathname;

  return <Progress isAnimating={isAnimating} />;
};

export { NProgress, Progress };
