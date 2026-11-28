// See https://svelte.dev/docs/kit/types#app
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
    interface PageState {
      /** /fresh: this creature came from "another", so ← can step back to the previous one. */
      another?: boolean;
      /** /fresh home, left via "another": the creature it was showing, so back returns to it. */
      pinned?: string;
      /** /fresh/c/[id], arriving from the draw page: the third this visitor just drew. */
      drawn?: "top" | "mid" | "bot";
    }
  }
}

export {};
