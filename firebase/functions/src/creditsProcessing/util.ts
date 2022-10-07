import {
  AppointmentValues,
  Credits,
  CreditType,
  OperationType,
  SubscriptionValues,
  TransactionType,
  UserBalance,
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
  return {visits, credits};
}

async function processBalancesForSubscriptions(
  userValues: UserBalance,
  subValues: SubscriptionValues,
  operationId: OperationType,
): Promise<UserBalance> {
  // const creditType = getData.getCreditTypeFromSubscriptions(subValues.type);

  let finalBalance: UserBalance = {
    visits: userValues.visits,
    credits: userValues.credits,
  };

  switch (operationId) {
    case OperationType.Credit: {
      finalBalance.credits = addCreditsFromSubscription(finalBalance, subValues);
      break;
    }
    case OperationType.Debit: {
      console.log("Scenario not implemented yet!");
      // Insert a more robust/custom solution here later
      /*
      finalBalance.credits[creditType]-=subValues.creditAmount;
      if(finalBalance.credits[creditType] < 0) {
        finalBalance.credits[creditType] = 0;
      }
      */
      break;
    }
  }
  return finalBalance;
}

function addCreditsFromSubscription(finalBalance: UserBalance, subValues: SubscriptionValues): Credits {
  const finalCredits = finalBalance.credits;
  const keys: string[] = Object.keys(subValues.credits);

  keys.forEach(element => {
    const creditType = CreditType[element as keyof typeof CreditType];
    const creditValue: number = subValues.credits[creditType];
    console.log(`adding credit type ${element} with value ${creditValue}`);
    finalBalance.credits[creditType] += creditValue;
  });

  return finalCredits;
}
