import {OperationType, TransactionType, AppointmentValues,UserBalance,CreditType} from "./types";
import * as getData from "./getData";
import * as updateData from "./updateData";
import {getAppointmentValues,getCreditTypeForAppointment} from "./getData";

export async function processCreditsAndVisits(userId: string, transactionType: TransactionType, transactionId: string, operation: OperationType) {
  const userBalances = await getData.getUserValues(userId);
  const appointmentVal = await getAppointmentValues(transactionId);
  // Determine if the operation involves adding or subtracting
  const updatedUserBalance = await processBalancesForAppointments(userBalances, appointmentVal, operation);

  await updateData.updateUserBalances(userId, updatedUserBalance);
}

async function processBalancesForAppointments(userValues: UserBalance, appointmentValues: AppointmentValues, operationId: OperationType): Promise<UserBalance> {

  const creditType = getCreditTypeForAppointment(appointmentValues.type);

  const finalBalance : UserBalance ={
        visits:userValues.visits,
        credits:userValues.credits
  }

  switch(operationId){

    case OperationType.Credit:
      {

        finalBalance.credits[creditType]++;

      }
      break;
      case OperationType.Debit:{
        if(userValues.visits > 0){

          onlyUpdateVisitsOnDebit(operationId, finalBalance, appointmentValues);
        }
        else{

          finalBalance.credits[creditType]--;
        }

      }
      break;

  }

  return finalBalance;
}

function onlyUpdateVisitsOnDebit(operationId: OperationType, finalBalance: UserBalance, appointmentValues: AppointmentValues) {
  if (operationId == OperationType.Debit) {

    finalBalance.visits -= appointmentValues.visitCost;
    if (finalBalance.visits < 0) {
      finalBalance.visits = 0;
    }
  }
}

