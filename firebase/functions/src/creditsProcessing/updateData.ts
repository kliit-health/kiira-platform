import {UserBalance, Credits} from "./types";
import {firestore} from "firebase-admin";


export async function setUser(u_id: string, values: UserBalance) {

  const userDocument = await firestore()
    .collection("users")
    .doc(u_id);

  const areCreditsDefined: boolean =  (await userDocument.get()).data()?.containsKey("Credits");
    
      if(areCreditsDefined == true){

        return updateCredits(userDocument,values.credits);
      }
      else {
        return updateVisits(userDocument,values.visits);
      }



}

export async function addCreditsFieldToUser(u_id: string, values: UserBalance) {

  const userDocument = await firestore()
    .collection("users")
    .doc(u_id);

    return updateCredits(userDocument,values.credits);

}


async function updateVisits(userdata : firestore.DocumentData, updateValue : number){

  return await userdata
    .set(
      {
        visits:updateValue,
      },
      {merge: true},
    );

}

async function updateCredits(userdata : firestore.DocumentData, updateValue : Credits){

  return await userdata
  .set(
    {
      credits: {
        MentalHealth: updateValue?.MentalHealth,
      },
    },
    {merge: true},
  );


}