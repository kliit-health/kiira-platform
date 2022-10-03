import {UserBalance} from "./types";
import {firestore} from "firebase-admin";


export async function updateUserBalances(u_id: string, newUserBalance: UserBalance) {

  await firestore()
    .collection("users")
    .doc(u_id)
    .set(
      {
        visits:newUserBalance.visits,
        credits: newUserBalance.credits
      },
      {merge: true},
    );

}
