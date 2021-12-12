<script>
	import { auth, db } from '$lib/firebase';
	import {
		onAuthStateChanged,
		signInAnonymously,
		linkWithPopup,
		signInWithCredential,
		GoogleAuthProvider,
		EmailAuthProvider // TODO: incorporate this option?
	} from 'firebase/auth';
	import { onMount } from 'svelte';
	import { user } from '$lib/stores';
	import { serverTimestamp, doc, writeBatch, setDoc } from 'firebase/firestore';

	onMount(async () => {
		// TODO: create user collection document with profile collection and append profile obj to $user?
		try {
			onAuthStateChanged(auth, async (firebaseUser) => {
				if (firebaseUser) {
					// TODO: append firebase user doc to $user?
					$user = firebaseUser;
				} else {
					const result = await signInAnonymously(auth);
					await createFirebaseDocs(result.user.uid);
					// TODO: append firebase user doc to $user?
					$user = result.user;
				}
			});
		} catch (error) {
			console.error(error);
		}
	});

	const signIn = async () => {
		try {
			const provider = new GoogleAuthProvider();
			const result = await linkWithPopup(auth.currentUser, provider);

			// TODO: merge current anon user firebase data with newly signed up user??
			await createFirebaseDocs(result.user.uid);

			// TODO: append firebase user doc to $user?
			$user = result.user;
		} catch (error) {
			try {
				const errorCred = GoogleAuthProvider.credentialFromError(error);
				await signInWithCredential(auth, errorCred);
				// TODO: merge current anon user firebase data with previously signed up user??
			} catch (error) {
				console.error(error);
			}
		}
	};

	const signOut = () => auth.signOut();
	const getRandomUsername = () => 'test';

	const createFirebaseDocs = async (uid) => {
		try {
			const username = getRandomUsername();
			const batch = writeBatch(db);
			batch.set(doc(db, 'users', uid), { username, joinDate: serverTimestamp() });
			batch.set(doc(db, 'users', uid, 'username', username), { uid });
			await batch.commit();
		} catch (error) {
			console.error();
		}
	};
</script>

<div>
	{#if !$user || $user.isAnonymous}
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
