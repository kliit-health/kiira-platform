import * as types from "./types";
import {OperationType} from "./types";
import {firestore} from "firebase-admin";


export async function getUserValues(uid: string): Promise<types.UpdateValues> {
  const user =
    (await firestore()
      .collection("users")
      .doc(uid)
      .get()).data();

  return {
    updatedCredits: user?.credits?.["MentalHealth"] ?? 0,
    updatedVisits: user?.visits ?? 0,
  };
}

export async function getAppointmentValuesFromType(transactionType: types.TransactionType, transactionId: string) {
  let appointmentVal: types.UpdateValues;

  switch (transactionType) {
    case types.TransactionType.Appointment: {
      appointmentVal = await getAppointmentValues(transactionId);
      appointmentVal.updatedVisits /= 2;
      break;
    }
    default: {
      appointmentVal = {
        updatedCredits: 0,
        updatedVisits: 0,
      };

      console.log("Invalid transactionType given!");
      break;
    }
  }
  return appointmentVal;
}

export async function getAppointmentValues(appointmentId: string): Promise<types.UpdateValues> {
  const appointmentDoc = await firestore()
    .collection("appointmentTypes")
    .doc(appointmentId)
    .get();

  // Insert Error handle if there was no appointment with valid id. Meaning .data is undefined
  const data = appointmentDoc.data(); // ?? { credits : 1, visits : 1 };

  console.log("credits : " + data?.credits);


  return {

    updatedCredits: data?.credits,
    updatedVisits: data?.credits,

  };



}

export async function getOperationFromId(opId: OperationType): Promise<number> {
  switch (opId) {
    case types.OperationType.Credit: {
      return 1;
    }
    case types.OperationType.Debit: {
      return -1;
    }
    default: {
      console.log("Invalid transactionType given!");
      return 1;
    }
  }
}
