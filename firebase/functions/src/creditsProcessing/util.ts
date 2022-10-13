import {Credits, CreditType, UserCredits as UserBalance} from "../domain/bll/services/service-pricing";

import {AppointmentValues, OperationType, SubscriptionValues, TransactionType} from "./types";

import {getAppointmentValues, getCreditTypeForAppointment, getSubscriptionValues, getUserValues} from "./getData";
import * as updateData from "./updateData";
import {EitherAsync} from "purify-ts";


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

// eslint-disable-next-line valid-jsdoc
/**
 * @deprecated
 */
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
      remainingBalance = await processBalancesForSubscriptions(
        currentBalance,
        subscriptionVal.unsafeCoerce(),
        operation,
      );
      break;
    }

    case TransactionType.SubscriptionRecurrence: {
      const subscriptionVal = await getSubscriptionValues(transactionId);
      remainingBalance = processBalancesForRenewal(currentBalance, subscriptionVal.unsafeCoerce());
      break;
    }
  }
  await updateData.updateUserBalances(userId, remainingBalance);
}

export function updateCreditBalance(
  userId: string,
  transactionType: TransactionType,
  transactionId: string,
  operation: OperationType,
): EitherAsync<string, void> {
  return EitherAsync(async ({fromPromise, throwE}) => {
    const currentBalance = await getUserValues(userId);
    let remainingBalance = currentBalance;
    switch (transactionType) {
      case TransactionType.Appointment: {
        try {
          const appointmentVal = await getAppointmentValues(transactionId);
          remainingBalance = calculateRemainingBalances(appointmentVal, currentBalance, operation);
        } catch (e) {
          throwE("AppointmentError");
        }
        break;
      }

      case TransactionType.Subscription: {
        const subscriptionVal = await fromPromise(getSubscriptionValues(transactionId));
        remainingBalance = await processBalancesForSubscriptions(currentBalance, subscriptionVal, operation);
        break;
      }

      case TransactionType.SubscriptionRecurrence: {
        const subscriptionVal = await fromPromise(getSubscriptionValues(transactionId).mapLeft(value => `Renewal error '${value}'`));
        remainingBalance = processBalancesForRenewal(currentBalance, subscriptionVal);
        break;
      }
    }
    await updateData.updateUserBalances(userId, remainingBalance);
  });
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

function processBalancesForSubscriptions(
  userValues: UserBalance,
  subValues: SubscriptionValues,
  operationId: OperationType,
): UserBalance {
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

function processBalancesForRenewal(
  userValues: UserBalance,
  subValues: SubscriptionValues,
): UserBalance {
  let {credits, visits} = userValues;

  credits = addCreditsFromRenewal(credits, subValues);
  return {credits, visits};
}

function addCreditsFromSubscription(credits: Credits, subValues: SubscriptionValues): Credits {
  subValues.credits.forEach(([key, value]) => {
    console.log(`adding credit type ${key} with value ${value}`);
    credits[<CreditType>key] += value;
  });

  return credits;
}

// TODO: Possible refactor to have the +1 and the 5 be a dynamic look up for the ammount of credits added by plans on the user
// +1 would represent the ammount of credits a longform plan could have added to them. 5 is the +1 and the ammount of credits given by
export function addCreditsFromRenewal(userCredits: Credits, subValues: SubscriptionValues): Credits {
  subValues.credits.forEach(([key, value]) => {
    let hasMemebershipCredit = true;
    let creditRefreshThreshold = value;

    if (userCredits[<CreditType>key] === 0) {
      hasMemebershipCredit = false;
    }

    if (hasMemebershipCredit) {
      creditRefreshThreshold++; // 4 + 1
    }

    if (userCredits[<CreditType>key] <= creditRefreshThreshold) {
      userCredits[<CreditType>key] = creditRefreshThreshold;
    }
    console.log(`adding credit type ${key} with value ${value}`);
  });

  return userCredits;
}

