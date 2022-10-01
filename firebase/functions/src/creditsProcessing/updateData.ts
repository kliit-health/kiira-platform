import * as types from "./types";
import {firestore} from "firebase-admin";


export async function setUser(u_id: string, values: types.UpdateValues) {

  const userDocument = await firestore()
    .collection("users")
    .doc(u_id);

  const areCreditsDefined: boolean = await userDocument.set();

  if (areCreditsDefined == true) {
    return updateCredits(userDocument, values.updatedCredits);
  } else {
    return updateVisits(userDocument, values.updatedVisits);
  }
}

async function updateVisits(userdata: firestore.DocumentData, updateValue: number) {

  return await userdata
    .set(
      {
        credits: {
          MentalHealth: updateValue,
        },
      },
      {merge: true},
    );

}

async function updateCredits(userdata: firestore.DocumentData, updateValue: number) {

  return await userdata
    .set(
      {
        visits: updateValue,
      },
      {merge: true},
    );

}
