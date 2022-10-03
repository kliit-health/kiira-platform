import {OperationType, TransactionType} from "./types";
import * as getData from "./getData";
import * as updateData from "./updateData";
import * as types from "./types";
import {getAppointmentValues} from "./getData";
import { number } from "purify-ts";

export async function processCreditsAndVisits(userId: string, transactionType: TransactionType, transactionId: string, operation: OperationType) {
  const userBalances = await getData.getUserValues(userId);
  const appointmentVal = await getAppointmentValues(transactionId);
  // Determine if the operation involves adding or subtracting
  const valuesToAdd = await processBalances(userBalances, appointmentVal, operation);

  await updateData.setUser(userId, valuesToAdd);
}

async function processBalances(userValues: types.UpdateValues, appointmentValues: types.AppointmentValues, operationId: OperationType): Promise<types.UserBalance> {
  const valuesSign = await getData.getOperationFromId(operationId);
  //Remove hardcoding for selection of userCredits to use here
  const userCredit: number | undefined = userValues.credits.MentalHealth;

const finalBalance : types.UserBalance ={
      visits:0,
      credits:{
       MentalHealth:0,
      },
}


if(userValues.visits > 0 && valuesSign == -1){

  finalBalance.visits = userValues.visits + appointmentValues.visitCost * valuesSign;
  if (finalBalance.visits < 0) {
    finalBalance.visits = 0;
  }
}
  if (userCredit) {
    
    finalBalance.credits.MentalHealth= userCredit + appointmentValues.visitCost * valuesSign;
    if (finalBalance.credits.MentalHealth < 0) {
      finalBalance.credits.MentalHealth= 0;
    }
  }


  return finalBalance;
}
