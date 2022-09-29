import * as types from "./types";
import {firestore} from "firebase-admin";


export async function getUserValues(u_id: string): Promise<types.UpdateValues> {
  const user =
    (await firestore()
      .collection("users")
      .doc(u_id)
      .get()).data();

  return {


    updatedCredits: user?.credits["MentalHealth"] ?? 0,
    updatedVisits: user?.visits ?? 0,
  };
}

export async function GetAppointmentValuesFromType(aType: types.AppointmentTypes, a_id: string) {
  let appointmentVal: types.UpdateValues;

  switch (aType) {
    case types.AppointmentTypes.Appointment: {
      appointmentVal = await getAppointmentValues(a_id);
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

export async function getAppointmentValues(a_id: string): Promise<types.UpdateValues> {
  const appointmentDoc = await firestore()
    .collection("appointmentTypes")
    .doc(a_id)
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

export async function getOperationFromId(o_id: string): Promise<number> {
  const opType: types.OperationTypes = types.OperationTypes[o_id as keyof typeof types.OperationTypes];

  switch (opType) {
    case types.OperationTypes.Credit: {
      return 1;
    }
      break;

    case types.OperationTypes.Debit: {
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
