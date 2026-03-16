import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  compilerOptions: {
    experimental: {
      // async/await in components and $derived — stabilizes in Svelte 6
      async: true,
    },
  },
  kit: {
    adapter: adapter(),
    alias: {
      $lib: "./src/lib",
    },
    experimental: {
      // .remote.ts files: query, form, command, prerender — SvelteKit 2.27+
      remoteFunctions: true,
    },
  },
};

export default config;
