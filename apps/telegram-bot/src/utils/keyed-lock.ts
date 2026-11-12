/**
 * Creates a per-key lock: tasks queued under the same key run one after another,
 * different keys run in parallel. Each call creates its own queue, so features
 * using it never wait on each other.
 */
export function createKeyedLock<K>() {
  // key → the promise of the last task queued for that key
  const tails = new Map<K, Promise<unknown>>();

  return function runExclusive<T>(key: K, task: () => Promise<T>): Promise<T> {
    const prev = tails.get(key) ?? Promise.resolve();
    // run after prev whether it succeeded or failed: one failed task mustn't block the next
    const run = prev.then(task, task);
    const tail = run.catch(() => {}); // the queue itself never rejects
    tails.set(key, tail);
    // forget the key once its queue is empty, so the Map doesn't grow forever
    void tail.then(() => {
      if (tails.get(key) === tail) tails.delete(key);
    });
    return run; // the caller still sees the task's own result or error
  };
}
