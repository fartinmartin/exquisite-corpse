/**
 * Gestures a visitor has already used, so their hints can stop showing.
 * Starts as "not known yet" (no hint on the server-rendered page, so nothing
 * flashes for people who've learned it); the hint fades in on the client.
 */
const KEY = "ecc-learned";

function read(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

function createLearned() {
  let known = $state<Set<string> | null>(null);

  return {
    /** `true` once the hint for `gesture` should show: on the client, and not yet used. */
    needs(gesture: string): boolean {
      return known !== null && !known.has(gesture);
    },
    /** Call from an `$effect` so `needs` works after hydration. */
    load() {
      if (known === null) known = read();
    },
    /** The visitor did it: no more hint for `gesture`. */
    learn(gesture: string) {
      const next = new Set(known ?? read());
      if (next.has(gesture)) return;
      next.add(gesture);
      known = next;
      try {
        localStorage.setItem(KEY, JSON.stringify([...next]));
      } catch {
        // private mode: the hint just stays for this visit
      }
    },
  };
}

export const learned = createLearned();
