import {CreditType, OperationType, TransactionType} from "./types";
import * as getData from "./getData";
import {getAppointmentValues, getCreditTypeForAppointment} from "./getData";
import * as updateData from "./updateData";

export async function processCreditsAndVisits(
  userId: string,
  transactionType: TransactionType,
  transactionId: string,
  operation: OperationType,
) {
  const userBalances = await getData.getUserValues(userId);
  const appointmentVal = await getAppointmentValues(transactionId);
  const creditType: CreditType = getCreditTypeForAppointment(appointmentVal.type);
  const newBalance = await processBalancesForAppointments(
    {visits: userBalances.visits, credits: userBalances.credits[creditType]},
    appointmentVal.visitCost,
    operation,
  );

  userBalances.visits = newBalance.visits;
  userBalances.credits[creditType] = newBalance.credits;

  await updateData.updateUserBalances(userId, userBalances);
}

export type Balance = { readonly visits: number, readonly credits: number };

export function processBalancesForAppointments(
  currentBalance: Balance,
  visitCost: number,
  operationId: OperationType,
): Balance {
  let {visits, credits} = currentBalance;

  switch (operationId) {
    case OperationType.Credit: {
      credits += 1;
      break;
    }
    case OperationType.Debit: {
      if (visits >= visitCost) {
        visits -= visitCost;
      } else if (credits > 0) {
        credits -= 1;
      }
      break;
    }
  }
  return {visits, credits};
}
