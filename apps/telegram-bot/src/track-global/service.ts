/*
 * the TTL is "how long am I willing to trust a cached answer before re-asking upstream."
 * The right length depends on how likely that answer is to have gone stale. A found parcel
 * — its checkpoints only ever get appended, and slowly (a scan every few hours), so a 6h-old
 * copy is almost certainly still accurate; serving it saves a request for near-zero risk.
 * A not-found is different: it very often means "the carrier hasn't registered it yet,"
 * which can flip to found within minutes. If you cached that for 6h, a user whose parcel
 * appears at minute 20 would keep seeing "no data" for the rest of the day. So misses
 * get a short leash — re-check soon — and hits get a long one. Same cache, two freshness
 * policies keyed on the outcome.
 * */

/** A found parcel's history is append-only and moves slowly → reuse for 6h. */
const FOUND_TTL_MS = 6 * 60 * 60 * 1000;
/** A "not found" is usually "not registered yet" — a transient answer → re-check in 30min. */
const MISS_TTL_MS = 30 * 60 * 1000;

/**
 * Is a cached row still within its freshness window? Miss rows expire faster
 * than hits, so a parcel that registers 20 minutes later isn't hidden for 6h.
 * @param row - the cached row (only `found` + `fetchedAt` matter here)
 */
export function isFresh(row: { found: boolean; fetchedAt: Date }): boolean {
  const ttl = row.found ? FOUND_TTL_MS : MISS_TTL_MS;
  return Date.now() - row.fetchedAt.getTime() < ttl;
}
