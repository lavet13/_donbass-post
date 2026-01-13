import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { Text } from "@radix-ui/themes";
import { useAtomValue } from "jotai";
import { useEffect, useState, type FC } from "react";
import { mainSidebarAtom, sidebarOpenAtom } from "@donbass-post/ui/main-sidebar/atom";

export const Footer: FC = () => {
  const currentYear = new Date().getFullYear();
  const mainSidebar = useAtomValue(mainSidebarAtom);

  const styles = getComputedStyle(document.documentElement);
  const middleBreakpoint = styles.getPropertyValue("--breakpoint-md");
  const isDesktop = useMediaQuery(
    `(min-width: calc(${middleBreakpoint} - 1px))`,
  );

  const cookieSidebarState = useAtomValue(sidebarOpenAtom);
  const isSidebarOpen = cookieSidebarState === "open" ? true : false;
  const [mainSidebarWidth, setMainSidebarWidth] = useState(0);

  useEffect(() => {
    if (!mainSidebar) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setMainSidebarWidth(entry.contentRect.width);
      }
    });
    resizeObserver.observe(mainSidebar);
    return () => {
      resizeObserver.disconnect();
    };
  }, [mainSidebar]);

  return (
    <div className="flex">
      {isSidebarOpen && mainSidebar && isDesktop && (
        <div
          style={{
            width: `${mainSidebarWidth}px`,
            flexGrow: 0,
            flexShrink: 0,
          }}
          className="min-w-0"
        />
      )}
      <footer
        className={cn(
          "bg-gray-2 border-grayA-6 flex flex-1 items-center justify-center rounded-t-lg xs:rounded-t-xl border-x border-t pt-6 pb-2",
        )}
      >
        <Text>&copy; {currentYear} - Наша Почта</Text>
      </footer>
    </div>
  );
};
