<script>
	import { auth, db } from '$lib/firebase';
	import {
		onAuthStateChanged,
		signInAnonymously,
		linkWithPopup,
		signInWithCredential,
		GoogleAuthProvider
		// EmailAuthProvider // TODO: incorporate this option?
	} from 'firebase/auth';
	import { onMount } from 'svelte';
	import { user } from '$lib/stores';
	import { serverTimestamp, doc, getDoc, getDocFromCache, writeBatch } from 'firebase/firestore';

	onMount(async () => {
		try {
			onAuthStateChanged(auth, async (firebaseUser) => {
				if (firebaseUser) {
					const docRef = doc(db, 'users', firebaseUser.uid);
					const docSnap = await getDoc(docRef);
					const pseudonym = docSnap.data().pseudonym;

					$user = { ...firebaseUser, pseudonym };
				} else {
					const result = await signInAnonymously(auth);
					const { pseudonym } = await createFirebaseUserDocs(result.user.uid);
					$user = { ...result.user, pseudonym };
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

			await mergeAnonFirebaseDocsWithNewUser();
			const { pseudonym } = await createFirebaseUserDocs(result.user.uid);

			$user = { ...result.user, pseudonym };
		} catch (error) {
			try {
				const errorCred = GoogleAuthProvider.credentialFromError(error);
				await signInWithCredential(auth, errorCred);
				await mergeAnonFirebaseDocsWithNewUser();
			} catch (error) {
				console.error(error);
			}
		}
	};

	const createFirebaseUserDocs = async (uid) => {
		try {
			const pseudonym = getRandomPseudonym();
			const batch = writeBatch(db);
			batch.set(doc(db, 'users', uid), { pseudonym, joinDate: serverTimestamp() });
			batch.set(doc(db, 'users', uid, 'pseudonym', pseudonym), { uid });
			await batch.commit();
			return { pseudonym };
		} catch (error) {
			console.error();
		}
	};

	const mergeAnonFirebaseDocsWithNewUser = async () => {
		// TODO: this, once I know how my docs/collections will work.
		// Firebase will merge uid/login info together. I need to re-attribute
		// any documents to the new doc(db, 'users', uid) user document
		// Perhaps, adding an "originalArtist" key to work done anonymously?
	};

	const signOut = () => auth.signOut();
	const getRandomPseudonym = () => 'test';
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
		height: 55ch;
		overflow-x: hidden;
		overflow-y: scroll;
	}
</style>
