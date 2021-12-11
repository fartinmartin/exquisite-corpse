<script context="module">
	export async function load({ page, fetch, session, stuff }) {
		return {
			props: {
				title: page.params.slug
			}
		};
	}
</script>

<script>
	export let title;
</script>

<h1>corpse: {title}</h1>
