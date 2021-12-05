<script>
	import { auth } from './firebase';
	import { signInAnonymously, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
	import { onMount } from 'svelte';
	import { user } from './stores';

	onMount(async () => {
		try {
			const res = await signInAnonymously(auth);
			$user = res.user;
		} catch (error) {
			console.log(error);
		}
	});
</script>
