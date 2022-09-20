import {firestore} from "firebase-admin";


 export async function getUserValues(u_id : string) : Promise<UpdateValues>{
  
  const user =
  (await firestore()
   .collection("users")
   .doc(u_id)
  .get()).data();

    return {

      
      updatedCredits : user?.credits["MentalHealth"] ?? 0,
      updatedVisits : user?.visits ?? 0,
    };  

 }

export async function getAppointmentValues(a_id : string) : Promise<UpdateValues>{

  
  const appointmentDoc = await firestore()
  .collection("appointmentTypes")
  .doc(a_id)
  .get();

    //Error handle if there was no appointment with valid id. Meaning .data is undefined
    const data = appointmentDoc.data() //?? { credits : 1, visits : 1 };

    console.log("data " + data);
    console.log("credits : " + data?.credits);

    return {

    updatedCredits : data?.credits,
    updatedVisits : data?.credits
      
    };

}

export async function getOperationFromId(o_id : string) : Promise<OperationSign>{


  return 1;

}
