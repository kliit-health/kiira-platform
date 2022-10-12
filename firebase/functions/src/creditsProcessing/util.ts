import {
  Credits,
  CreditType,
  UserCredits as UserBalance,
} from "../domain/bll/services/service-pricing";

import {
  AppointmentValues,

  SubscriptionValues,
  OperationType,
  TransactionType,
} from "./types";

import {getAppointmentValues, getCreditTypeForAppointment, getSubscriptionValues, getUserValues} from "./getData";
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
  const currentBalance = await getUserValues(userId);
  let remainingBalance = currentBalance;
  switch (transactionType) {
    case TransactionType.Appointment: {
      const appointmentVal = await getAppointmentValues(transactionId);
      remainingBalance = calculateRemainingBalances(appointmentVal, currentBalance, operation);
      break;
    }

    case TransactionType.Subscription: {
      const subscriptionVal = await getSubscriptionValues(transactionId);
      remainingBalance = await processBalancesForSubscriptions(currentBalance, subscriptionVal, operation);
      break;
    }
  }
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
  return {credits, visits};
}

async function processBalancesForSubscriptions(
  userValues: UserBalance,
  subValues: SubscriptionValues,
  operationId: OperationType,
): Promise<UserBalance> {
  let {credits, visits} = userValues;

  switch (operationId) {
    case OperationType.Credit: {
      credits = addCreditsFromSubscription(credits, subValues);
      break;
    }
    case OperationType.Debit: {
      console.error("Scenario not implemented!");
      break;
    }
  }
  return {credits, visits};
}

function addCreditsFromSubscription(credits: Credits, subValues: SubscriptionValues): Credits {
  const entries = Object.entries(subValues.credits);
  entries.forEach(([key, value]) => {
    console.log(`adding credit type ${key} with value ${value}`);
    credits[<CreditType>key] += value;
  });

  return credits;
}
