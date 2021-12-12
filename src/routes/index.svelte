<script context="module">
	export const load = async ({ fetch }) => {
		const res = await fetch('/corpse/random.json');
		const data = await res.json();
		return {
			props: { data }
		};
	};
</script>

<script>
	export let data;
	// home: collectionGroup query (1 rando)
	// gallery: collectionGroup query (limit 9)
	// corpse (1): ?
	// @[user]: query (limit 3?)
	// @[user]/slug: query (?)
	// anonymous login if/when creating a section.. then assign section to anon.uid
	// later.. offer the signup/claiming of anon user (i will then need a login button?)
	// add a "transparency" info/about page? (totally unnecessary but an interesting.. political point lololol)
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<pre>{JSON.stringify(data, undefined, 2)}</pre>

<style>
	pre {
		width: 55ch;
		height: 55ch;
		overflow-x: hidden;
		overflow-y: scroll;
	}
</style>
