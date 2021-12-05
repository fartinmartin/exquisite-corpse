import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		// https://kit.svelte.dev/faq#integrations
		// https://github.com/benmccann/sveltekit-firebase/blob/9e3097fd859e4f81e4775885ecb584561f098fd3/svelte.config.js#L11
		vite: {
			ssr: {
				external: ['whatwg-url', 'node-fetch']
			}
		}
	}
};

export default config;
