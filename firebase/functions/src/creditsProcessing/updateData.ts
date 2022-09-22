import * as types from "./types";
import {firestore} from "firebase-admin";


export async function setUser(uId : string, values : types.UpdateValues) {
    const visits = values.updatedVisits;
    const credits = values.updatedCredits;

    return firestore()
   .collection("users")
   .doc(uId)
   .set(
    {
      visits,
      credits: {
        MentalHealth: credits,
      },
    },
    {merge: true}
   );
  }
