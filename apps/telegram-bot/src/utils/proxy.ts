import { socksDispatcher } from "fetch-socks";

/**
 * Build an undici dispatcher that tunnels through a SOCKS5(h) proxy.
 * Returns undefined when no proxy is configured → fetch goes direct (unchanged behavior).
 * @param proxyUrl - a socks5h://user:pass@host:port string, or undefined
 */
export function makeProxyDispatcher(proxyUrl: string | undefined) {
  if (!proxyUrl) return undefined;
  const u = new URL(proxyUrl);                       // URL parses socks5h:// fine
  return socksDispatcher({
    type: 5,                                         // SOCKS5
    host: u.hostname,
    port: Number(u.port),
    userId: decodeURIComponent(u.username) || undefined,   // creds live in the URL
    password: decodeURIComponent(u.password) || undefined,
  });
}
