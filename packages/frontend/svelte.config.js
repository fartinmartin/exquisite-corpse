import adapter from "svelte-kit-sst";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			$styles: "src/ui/styles",
			$bits: "src/ui/bits",
		},
	},
};

export default config;
