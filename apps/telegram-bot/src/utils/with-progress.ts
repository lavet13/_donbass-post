import { setTimeout as sleep } from "node:timers/promises"; // Node's promise version of setTimeout

/**
 * Runs `task` while `show` animates "label." → "label.." → "label..." in a loop.
 * The animation always stops BEFORE this resolves, so the caller's final edit
 * can never be overwritten by a late frame. Errors from `task` still reach the
 * caller; a failed frame is ignored. ~1.5 s per frame stays under Telegram's
 * edit flood limit.
 */
export async function withProgress<T>(
  show: (text: string) => Promise<unknown>,
  label: string,
  task: () => Promise<T>,
  frameMs = 1500,
): Promise<T> {
  // `stopped` resolves the moment the task ends, waking the animation early
  let stop!: () => void; // "!" = assigned inside the Promise constructor below
  const stopped = new Promise<"stop">(
    (resolve) => (stop = () => resolve("stop")),
  );

  const ticker = (async () => {
    for (let dots = 1; ; dots = (dots % 3) + 1) {
      // 1, 2, 3, 1, 2, 3, …
      await show(label + ".".repeat(dots)).catch(() => {});
      // wait for the next frame OR the stop signal, whichever comes first
      if (
        (await Promise.race([sleep(frameMs, "tick" as const), stopped])) ===
        "stop"
      )
        return;
    }
  })();

  try {
    return await task();
  } finally {
    stop(); // runs on success AND failure
    await ticker; // let an edit already in flight land before the caller's final edit
  }
}
