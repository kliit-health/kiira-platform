import {OperationType, TransactionType} from "./types";
import * as getData from "./getData";
import * as updateData from "./updateData";
import * as types from "./types";

export async function processCreditsAndVisits(userId: string, transactionType: TransactionType, transactionId: string, operation: OperationType) {
  const userVal = await getData.getUserValues(userId);
  const appointmentVal = await getData.getAppointmentValuesFromType(transactionType, transactionId);
  // Determine if the operation involves adding or subtracting
  const valuesToAdd = await processValuesToAdd(userVal, appointmentVal, operation);

  await updateData.setUser(userId, valuesToAdd);
}

async function processValuesToAdd(userValues: types.UpdateValues, appointmentValues: types.UpdateValues, operationId: OperationType): Promise<types.UpdateValues> {
  const valuesSign = await getData.getOperationFromId(operationId);
  // console.log(`adding user credit ${userValues.updatedCredits} to appoinmet credits ${appointmentValues.updatedCredits*valuesSign}`);
  let finalCredits = userValues.updatedCredits + appointmentValues.updatedCredits * valuesSign;
  if (finalCredits < 0) {
    finalCredits = 0;
  }

  let finalVisits = userValues.updatedVisits + appointmentValues.updatedVisits * valuesSign;
  if (finalVisits < 0) {
    finalVisits = 0;
  }

  return {

    updatedCredits: finalCredits,
    updatedVisits: finalVisits,

  };
}
