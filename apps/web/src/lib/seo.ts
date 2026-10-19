/**
 * <head> tags for TanStack Router's `head` route option, rendered by <HeadContent />
 * in __root.tsx. Child routes are merged over their parents, so the root's
 * defaults apply to any route that doesn't set its own.
 */

const SITE_NAME = "Наша Почта";

/** Title + description, with Open Graph copies so Telegram/VK link previews match search results. */
export function pageHead({ title, description }: { title: string; description: string }) {
  const fullTitle = title === SITE_NAME ? title : `${title} — ${SITE_NAME}`;
  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "ru_RU" },
    ],
  };
}

/**
 * Keeps a page out of search results while still letting crawlers follow its links.
 * Used for login, the dashboard and the 404 page.
 */
export const NOINDEX = { name: "robots", content: "noindex, follow" } as const;
