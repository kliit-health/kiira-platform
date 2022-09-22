import * as types from "./types";
import {firestore} from "firebase-admin";


 export async function getUserValues(uId : string) : Promise<types.UpdateValues> {
  const user =
  (await firestore()
   .collection("users")
   .doc(uId)
  .get()).data();

    return {


      updatedCredits: user?.credits["MentalHealth"] ?? 0,
      updatedVisits: user?.visits ?? 0,
    };
 }

 export async function getAppointmentValuesFromType(aType: types.AppointmentTypes, aId: string) {
  let appointmentVal: types.UpdateValues;

  switch (aType) {
      case types.AppointmentTypes.Appointment:
          {
              appointmentVal = await getAppointmentValues(aId);
          }
          break;

      default: {
          appointmentVal = {
              updatedCredits: 0,
              updatedVisits: 0,
          };

          console.log("Invalid transactionType given!");
      }
          break;
  }
  return appointmentVal;
}

export async function getAppointmentValues(aId : string) : Promise<types.UpdateValues> {
  const appointmentDoc = await firestore()
  .collection("appointmentTypes")
  .doc(aId)
  .get();

    // Error handle if there was no appointment with valid id. Meaning .data is undefined
    const data = appointmentDoc.data(); // ?? { credits : 1, visits : 1 };

    console.log("data " + data);
    console.log("credits : " + data?.credits);

    return {

    updatedCredits: data?.credits,
    updatedVisits: data?.credits,

    };
}

export async function getOperationFromId(oId : string) : Promise<number> {
  const opType : types.OperationTypes = types.OperationTypes[oId as keyof typeof types.OperationTypes];

  switch (opType) {
      case types.OperationTypes.Credit:
          {
              return 1;
          }
          break;

      case types.OperationTypes.Debit:
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
