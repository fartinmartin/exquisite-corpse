import adapterNode from "@sveltejs/adapter-node";
import adapterNetlify from "@sveltejs/adapter-netlify";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/**
 * Netlify is the deploy target (SSR functions + CDN). Set ADAPTER=node to build
 * a plain Node server instead.
 */
const adapter =
  process.env.ADAPTER === "node" ? adapterNode() : adapterNetlify();

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
    adapter,
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
