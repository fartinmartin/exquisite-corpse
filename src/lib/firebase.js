import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
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

connectAuthEmulator(auth, 'http://localhost:9099');
connectFirestoreEmulator(db, 'localhost', 8080);
connectStorageEmulator(storage, 'localhost', 9199);

// import admin from 'firebase-admin';
// import serviceAccount from '../../serviceAccountKey.json';

// admin.initializeApp({
// 	credential: admin.credential.cert(serviceAccount)
// });

// export const db_admin = admin.firestore();
