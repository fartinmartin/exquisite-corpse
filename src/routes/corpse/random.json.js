// import { db_admin } from "$lib/firebase";

export async function get() {
	return {
		body: {
			string: 'you hit /corpse/random.json.js'
			// data: docSnap.data()
		}
	};
}

// export async function get() {
// 	const docRef = doc(db, 'corpses', 'Temyry2Q5aX3diC8zdw0');
// 	const docSnap = await getDoc(docRef);

// 	if (docSnap.exists()) {
// 		return {
// 			body: {
// 				data: docSnap.data()
// 			}
// 		};
// 	} else {
// 		console.log('No such document!');
// 	}
// }

// const corpses = db.collection('corpses');
// const key = corpses.doc().id;
// const docId = db.firestore.FieldPath.documentId();

// corpses
// 	.where(docId, '>=', key)
// 	.limit(1)
// 	.get()
// 	.then((snapshot) => {
// 		if (snapshot.size > 0) {
// 			snapshot.forEach((doc) => {
// 				console.log(doc.id, '=>', doc.data());
// 			});
// 		} else {
// 			const corpse = corpses
// 				.where(docId, '<', key)
// 				.limit(1)
// 				.get()
// 				.then((snapshot) => {
// 					snapshot.forEach((doc) => {
// 						console.log(doc.id, '=>', doc.data());
// 					});
// 				})
// 				.catch((err) => {
// 					console.log('Error getting documents', err);
// 				});
// 		}
// 	})
// 	.catch((err) => {
// 		console.log('Error getting documents', err);
// 	});
