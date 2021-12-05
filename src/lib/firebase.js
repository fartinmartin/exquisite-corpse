// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
	apiKey: 'AIzaSyDCMQy5SMkgPBfnZVP48gYXkPbioHtHaHQ',
	authDomain: 'ecc-sveltekit.firebaseapp.com',
	projectId: 'ecc-sveltekit',
	storageBucket: 'ecc-sveltekit.appspot.com',
	messagingSenderId: '646794968674',
	appId: '1:646794968674:web:9f1e2b532d45a4d2e11b3b'
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
