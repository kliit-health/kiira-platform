import * as updateTypes from './types';
import {firestore} from "firebase-admin";


 export async function getUserValues(u_id : string) : Promise<updateTypes.UpdateValues>{
  
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

 export async function getAppointmentValuesFromType(aType: updateTypes.AppointmentTypes, a_id: string) {

  let appointmentVal: updateTypes.UpdateValues;

  switch (aType) {

      case updateTypes.AppointmentTypes.Appointment:
          {

              appointmentVal = await getAppointmentValues(a_id);
          }
          break;

      default: {

          appointmentVal = {
              updatedCredits: 0,
              updatedVisits: 0
          };

          console.log("Invalid transactionType given!");

      }
          break;

  }
  return appointmentVal;
}

export async function getAppointmentValues(a_id : string) : Promise<updateTypes.UpdateValues>{

  
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

export async function getOperationFromId(o_id : string) : Promise<number>{

  const opType : updateTypes.OperationTypes = updateTypes.OperationTypes[o_id as keyof typeof updateTypes.OperationTypes];

  switch (opType) {

      case updateTypes.OperationTypes.Credit:
          {
              return 1;
          }
          break;
        
      case updateTypes.OperationTypes.Debit:
            {
                return -1;
            }
            break;

      default: {

          console.log("Invalid transactionType given!");
          return 1;

      }
      break;

  }

}
