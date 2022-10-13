import {UserCredits} from "../domain/bll/services/service-pricing";
import {firestore} from "firebase-admin";


export async function updateUserBalances(uid: string, newUserBalance: UserCredits) {
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
