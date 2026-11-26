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
  define: {
    // Netlify's Image CDN (`/.netlify/images`) only exists on Netlify deploys.
    __NETLIFY_IMAGE_CDN__: JSON.stringify(process.env.NETLIFY === "true"),
  },
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
    external: ["@napi-rs/canvas", "firebase-admin"],
    // ...or pre-bundled by the dev server's dependency optimizer, which tries
    // to read the `.node` binary as source and crashes `vite dev`.
    optimizeDeps: { exclude: ["@napi-rs/canvas"] },
  },
  optimizeDeps: { exclude: ["@napi-rs/canvas"] },
});
