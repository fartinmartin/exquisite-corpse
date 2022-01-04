<script context="module">
	export async function load({ page, fetch, session, stuff }) {
		return {
			props: {
				user: page.params.user,
				title: page.params.slug
			}
		};
	}
</script>

<script>
	export let user;
	export let title;
</script>

<h1>section: {title}</h1>
<h1>by: {user}</h1>
