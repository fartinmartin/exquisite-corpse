<script context="module">
	export async function load({ page, fetch, session, stuff }) {
		return {
			props: {
				user: page.params.user
			}
		};
	}
</script>

<script>
	export let user;
</script>

<h1>user: {user}</h1>
