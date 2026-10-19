import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { render, PRERENDER_PATHS } from "../dist-ssr/entry-server.js";

/**
 * Writes one real HTML file per public route (dist/tracking/index.html, ...), so
 * nginx serves content instead of an empty <div id="root">. React then takes over
 * in main.tsx with createRoot, replacing the markup with an identical client render.
 *
 * dist/spa.html keeps the untouched shell: nginx falls back to it for client-only
 * routes (dashboard, auth, unknown URLs). Without it, those would get the
 * prerendered home page's HTML, because dist/index.html IS the home page now.
 *
 * sitemap.xml and robots.txt are written from the same PRERENDER_PATHS list, so a
 * page added there is prerendered and listed for crawlers in one place.
 * SITE_URL overrides the production origin (e.g. for a staging host). `||`, not `??`:
 * an unset GitHub Actions variable arrives as "" (not undefined), and "" must fall back too.
 */
const SITE_URL = (process.env.SITE_URL || "https://donbass-post.duckdns.org").replace(/\/+$/, ""); // no trailing slash; paths start with /

const shell = await readFile("dist/index.html", "utf8");
await writeFile("dist/spa.html", shell);

for (const path of PRERENDER_PATHS) {
  const body = await render(path);

  // React 19 moves <title>/<meta>/<link> to the start of renderToString's output:
  // group 1 = that leading run of head tags, group 2 = the page markup after it
  const [, headTags, rest] = body.match(/^((?:<(?:title|meta|link)\b[^>]*>(?:[^<]*<\/title>)?)*)([\s\S]*)$/);
  if (!rest.trim()) throw new Error(`prerender: ${path} rendered empty`);
  if (!headTags.includes("<title")) throw new Error(`prerender: ${path} has no <title> (missing head option?)`);

  const html = shell
    // drop the shell's static title + description; the route's own tags replace them
    .replace(/<title data-static-head>[^<]*<\/title>/, "")
    .replace(/<meta\s+data-static-head[^>]*>/, "")
    // data-static-head: main.tsx removes these before React renders its own head tags
    .replace("</head>", `  ${headTags.replace(/<(title|meta|link)\b/g, "<$1 data-static-head")}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${rest}</div>`);

  const dir = join("dist", path);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), html);
  console.log(`prerendered ${path}`);
}

// One <url> per page actually written above; <loc> must be an absolute URL
const urls = PRERENDER_PATHS.map((path) => `  <url><loc>${SITE_URL}${path}</loc></url>`).join("\n");
await writeFile(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);
await writeFile(
  "dist/robots.txt",
  [
    "User-agent: *",
    "# Every dashboard URL redirects to the login page for a crawler; nothing to index there.",
    "Disallow: /dashboard",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n"),
);
console.log(`sitemap.xml + robots.txt for ${SITE_URL}`);
