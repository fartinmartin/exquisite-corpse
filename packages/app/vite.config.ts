import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    allowedHosts: true,
  },
  ssr: {
    // native addon / server-only SDK — cannot be bundled by Vite
    external: ["canvas", "firebase-admin"],
  },
});
