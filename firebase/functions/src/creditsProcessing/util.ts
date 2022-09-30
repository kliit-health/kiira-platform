import {OperationType, TransactionType} from "./types";
import * as getData from "./getData";
import * as updateData from "./updateData";
import * as types from "./types";
import {getAppointmentValues} from "./getData";

export async function processCreditsAndVisits(userId: string, transactionType: TransactionType, transactionId: string, operation: OperationType) {
  const userBalances = await getData.getUserValues(userId);
  const appointmentVal = await getAppointmentValues(transactionId);
  // Determine if the operation involves adding or subtracting
  const valuesToAdd = await processBalances(userBalances, appointmentVal, operation);

  await updateData.setUser(userId, valuesToAdd);
}

async function processBalances(userValues: types.UserBalance, appointmentValues: types.AppointmentValues, operationId: OperationType): Promise<types.UserBalance> {
  const valuesSign = await getData.getOperationFromId(operationId);
  const userCredit: number | undefined = userValues.credits?.[appointmentValues.type];

  if (userCredit) {
    let finalCredits = userCredit + valuesSign;
    if (finalCredits < 0) {
      finalCredits = 0;
    }
  }

  let updatedVisits = userValues.visits + appointmentValues.visitCost * valuesSign;
  if (updatedVisits < 0) {
    updatedVisits = 0;
  }

  return {
    updatedCredits: finalCredits,
    updatedVisits,
  };
}
