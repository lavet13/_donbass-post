import { atomWithCookie } from "@/lib/atom";
import { atom } from "jotai";

const sidebarOpenAtom = atomWithCookie<"open" | "closed">(
  "sidebar-state",
  "open",
  {
    /** Cookie expiration time in days */
    expires: 365,
    /** Only send cookie over HTTPS in production */
    secure: !!import.meta.env.PROD,
    /** CSRF protection - strict in prod, lax in dev for easier development */
    sameSite: import.meta.env.PROD ? "strict" : "lax",
  },
);

const mainSidebarAtom = atom<HTMLDivElement | null>(null);

export { sidebarOpenAtom, mainSidebarAtom };
