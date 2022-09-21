
const firebaseSingleAdmin = require("firebase-admin");
module.exports = (collectionName:any, id:any) =>
	new Promise((resolve, reject) =>
		(async function() {
			const database = firebaseSingleAdmin.firestore();
			try {
				const document = await database.collection(collectionName).doc(id).get();
				const data = document.data();
				resolve(data);
			} catch (error) {
				reject(error);
			}
		})()
	);
