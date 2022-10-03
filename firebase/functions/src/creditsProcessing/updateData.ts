import {UserBalance} from "./types";
import {firestore} from "firebase-admin";


export async function updateUserBalances(uid: string, newUserBalance: UserBalance) {
  await firestore()
    .collection("users")
    .doc(uid)
    .set(
      {
        visits: newUserBalance.visits,
        credits: newUserBalance.credits,
      },
      {merge: true},
    );
}
