import { createContext, useContext } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";

export type SidebarContextProps = {
  panelRef: React.RefObject<ImperativePanelHandle | null>;
  collapsedSize: number;
  minimalSize: number;
  expandedSize: number;
  isMobile: boolean;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  handleResize: (size: number) => void;
};

export const SidebarContext = createContext<SidebarContextProps | null>(null);

export const useSidebar = () => {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }

  return context;
};
