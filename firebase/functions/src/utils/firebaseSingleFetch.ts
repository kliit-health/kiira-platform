import firebaseSingleAdmin = require("firebase-admin");

export function firebaseSingleFetch(collectionName: any, id: any): Promise<any> {
  return new Promise((resolve, reject) =>
    (async function() {
      const database = firebaseSingleAdmin.firestore();
      try {
        const document = await database.collection(collectionName).doc(id).get();
        const data = document.data();
        resolve(data);
      } catch (error) {
        reject(error);
      }
    })(),
  );
}
