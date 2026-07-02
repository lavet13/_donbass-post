# telemt double-hop (Moscow → NL → Telegram)

## Problem
`direct` upstream "didn't work" on VPS1 (splinterx-ui) — clients couldn't use the
proxy. Hypothesis: Moscow→Telegram egress is the blocked leg, so route telemt's
upstream out through the NL box (153.76.117.52, clean egress) instead.

## ⚠ Premise check — Step 0, BEFORE building anything
The double-hop ONLY fixes egress (proxy→Telegram). It does NOTHING for
client→proxy reachability. Decide which leg is broken with a curl from two networks:

  curl -sv https://<front-domain>/      # real cert + 200 from the mask backend?

- From a CLEAN network (NL box / laptop on normal internet):
    fails  → server/config problem (cert, announce, mask wiring). NOT DPI. Fix that first.
    works  → server is fine → test from the client side ↓
- From the FAILING client network (same one where it broke):
    works  → front is reachable → egress (Leg 2) is the culprit → double-hop is the fix.
    fails  → client→proxy blocked (e.g. mobile "белый список") → double-hop WON'T help. STOP.

Also: VPS1 ≠ VPS2. VPS1's result doesn't predict the Moscow box (different IP/network).
One `direct` smoke test on VPS2 + read telemt logs:
  DCs connect but clients fail        → Leg 1 (don't tunnel)
  "All ME servers for DC failed ..."  → Leg 2 (tunnel justified)

## Transport (decided): reuse existing NL AmneziaWG
NL already runs `amnezia-awg2` (UDP 31657). Moscow joins as a peer = obfuscated
Moscow↔NL link. Wrinkle: that container is Amnezia-managed, so adding a
server-to-server peer may need the Amnezia tooling, not raw wg edits. (Open Q.)

## Egress-hop approaches (only if Step 0 says Leg 2)
1. SOCKS5 upstream → SOCKS server on NL (NL's tunnel IP).
   + no Telegram IP list; container-friendly (telemt only needs to reach NL tunnel IP)
   − forces use_middle_proxy=false → lose ad_tag; need a SOCKS server on NL;
     DEPENDS on 3.3.22 actually shipping socks5 upstream (verify — may postdate the pin)
2. Host policy-route Telegram ranges via awg0; telemt stays direct + middle-proxy.
   + keeps middle_proxy/ad_tag; version-agnostic (OS-level → safe with the 3.3.22 pin)
   − must maintain Telegram IP ranges; verify bridge-container egress follows host route
3. Default-route ALL Moscow egress via the tunnel.
   − routes bot/web/system traffic too; tunnel becomes a SPOF for everything. Reject.

## Leaning
Approach 2 — because the 3.3.22 pin is non-negotiable (FakeTLS regression above it),
and OS-level routing doesn't care what telemt version supports. Approach 1 only if
ad_tag is expendable AND 3.3.22 is confirmed to have socks5 upstream.

## Open questions
1. Which leg is broken? (Step 0 — gates the entire plan.)
2. Need ad_tag / sponsored channels? (Approach 1 kills them.)
3. Does pinned 3.3.22 support the socks5 upstream block? (decides 1 vs 2)
4. Can Moscow be added as an awg peer without fighting the Amnezia container tooling?

## Next step
Run Step 0. No tunnel work until Leg 2 is confirmed.
