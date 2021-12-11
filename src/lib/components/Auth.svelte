<script>
	import { auth } from '$lib/firebase';
	import {
		signInAnonymously,
		signInWithPopup,
		linkWithPopup,
		GoogleAuthProvider,
		EmailAuthProvider,
		linkWithCredential,
		signInWithCredential
	} from 'firebase/auth';
	import { onMount } from 'svelte';
	import { user } from '$lib/stores';

	onMount(async () => {
		// TODO: create user collection document with profile collection and append profile obj to $user?
		try {
			const res = await signInAnonymously(auth);
			$user = res.user;
		} catch (error) {
			console.error(error);
		}
	});

	const signUp = async () => {
		// TODO: create user collection document with profile collection and append profile obj to $user?
		try {
			const provider = new GoogleAuthProvider();
			const result = await linkWithPopup(auth.currentUser, provider);
			$user = result.user;
		} catch (error) {
			try {
				// TODO: merge current anon user data with previously signed up user??
				const credential = GoogleAuthProvider.credentialFromError(error);
				const result = await signInWithCredential(auth, credential);
				$user = result.user;
			} catch (error) {
				console.error(error);
			}
		}
	};

	const signIn = async () => {
		// TODO: append profile obj to $user?
		try {
			const provider = new GoogleAuthProvider();
			const result = await signInWithPopup(auth, provider);
			$user = result.user;
		} catch (error) {
			console.error(error);
		}
	};

	const signOut = () => {
		auth.signOut();
		$user = null; // TODO: sign in anonymously again?
	};
</script>

<div>
	{#if !$user || $user.isAnonymous}
		<button on:click={signUp}>sign up</button>
		<button on:click={signIn}>sign in</button>
	{:else}
		<button on:click={signOut}>sign out</button>
	{/if}

	{#if $user}
		<pre>{JSON.stringify($user, undefined, 2)}</pre>
	{/if}
</div>

<style>
	pre {
		width: 55ch;
		overflow: scroll;
	}
</style>
