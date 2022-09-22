import * as admin from "firebase-admin";

const firestore = admin.firestore();
export type FirestoreDb = typeof firestore;
