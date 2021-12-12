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
	import { slugify } from '$lib/utils';

	export let user;
	export let title = slugify('cool title! man™');
</script>

<h1>user: {user}</h1>
<a href="@{user}/{title}">mock section</a>
