import adapterNode from "@sveltejs/adapter-node";
import adapterNetlify from "@sveltejs/adapter-netlify";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

/**
 * Netlify is the deploy target (SSR functions + CDN). Set ADAPTER=node to build
 * a plain Node server instead.
 */
const adapter = process.env.ADAPTER === "node" ? adapterNode() : adapterNetlify();

export default defineConfig({
  plugins: [
    sveltekit({
      preprocess: vitePreprocess(),
      compilerOptions: {
        experimental: {
          // async/await in components and $derived — stabilizes in Svelte 6
          async: true
        }
      },
      adapter,
      experimental: {
        // .remote.ts files: query, form, command, prerender — SvelteKit 2.27+
        remoteFunctions: true
      }
    })
  ],
  server: { allowedHosts: true },
  ssr: {
    // native addon / server-only SDK — cannot be bundled by Vite
    external: ["canvas", "firebase-admin"],
  },
});
