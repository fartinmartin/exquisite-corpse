<script>
	import { auth } from '$lib/firebase';
	import { signInAnonymously, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
	import { onMount } from 'svelte';
	import { user } from '$lib/stores';

	onMount(async () => {
		try {
			const res = await signInAnonymously(auth);
			$user = res.user;
		} catch (error) {
			console.log(error);
		}
	});
</script>

{#if $user}
	<button>signup/convert anon</button>
	<pre>{JSON.stringify($user, undefined, 2)}</pre>
{/if}

<style>
	pre {
		width: 55ch;
		overflow: scroll;
	}
</style>
