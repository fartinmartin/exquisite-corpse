<script>
	import { user } from '$lib/stores';
	$: console.log($user);
</script>

<a href="/">home</a>
<a href="/gallery">gallery</a>

{#if $user}
	<a href="/@{$user.uid}">your profile</a>
{/if}
