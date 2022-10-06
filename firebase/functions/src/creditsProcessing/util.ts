import {AppointmentValues, Credits, CreditType, OperationType, TransactionType, UserBalance} from "./types";
import * as getData from "./getData";
import {getAppointmentValues, getCreditTypeForAppointment} from "./getData";
import * as updateData from "./updateData";

function replaceIn<T>(o: { [s: string]: T } | ArrayLike<T>, k: string, v: T): { [p: string]: T } {
  return Object.fromEntries(Object.entries(o)
    .map(([key, val]) => {
      if (key === k) {
        return [key, v];
      } else {
        return [key, val];
      }
    }));
}

export function calculateRemainingBalances(
  appointmentVal: AppointmentValues,
  userBalance: UserBalance,
  operation: OperationType,
): UserBalance {
  const creditType: CreditType = getCreditTypeForAppointment(appointmentVal.type);
  const remaining: Balance = processBalancesForAppointments(
    {visits: userBalance.visits, credits: userBalance.credits[creditType]},
    appointmentVal.visitCost,
    operation,
  );
  const credits = <Credits>replaceIn(userBalance.credits, creditType, remaining.credits);

  return {visits: remaining.visits, credits: credits};
}

export async function processCreditsAndVisits(
  userId: string,
  transactionType: TransactionType,
  transactionId: string,
  operation: OperationType,
) {
  const currentBalance = await getData.getUserValues(userId);
  const appointmentVal = await getAppointmentValues(transactionId);
  const remainingBalance = calculateRemainingBalances(appointmentVal, currentBalance, operation);
  await updateData.updateUserBalances(userId, remainingBalance);
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
