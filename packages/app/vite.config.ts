import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    allowedHosts: true,
  },
  ssr: {
    // node-canvas is a native addon — cannot be bundled by Vite
    external: ["canvas"],
  },
});
