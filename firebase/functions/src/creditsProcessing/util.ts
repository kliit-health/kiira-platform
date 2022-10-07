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

export async function processCreditsAndVisits(
  userId: string,
  transactionType: TransactionType,
  transactionId: string,
  operation: OperationType,
) {
  const userBalances = await getUserValues(userId);

  let updatedUserBalance: UserBalance = {
    visits: userBalances.visits,
    credits: userBalances.credits,

  };
  console.log("Handling Transaction " + transactionType);
  switch (transactionType) {
    case TransactionType.Appointment: {
      const appointmentVal = await getAppointmentValues(transactionId);
      updatedUserBalance = await processBalancesForAppointments(userBalances, appointmentVal, operation);
      break;
    }

    case TransactionType.Subscription: {
      const subscriptionVal = await getSubscriptionValues(transactionId);

      updatedUserBalance = await processBalancesForSubscriptions(userBalances, subscriptionVal, operation);
      break;
    }
  }
  const displayCredits = updatedUserBalance.credits[CreditType.TherapySession];
  console.log("The new user balance's credits are " + displayCredits);
  await updateData.updateUserBalances(userId, updatedUserBalance);
}

async function processBalancesForAppointments(
  userValues: UserBalance,
  appointmentValues: AppointmentValues,
  operationId: OperationType,
): Promise<UserBalance> {
  const creditType = getCreditTypeForAppointment(appointmentValues.type);

  const finalBalance: UserBalance = {
    visits: userValues.visits,
    credits: userValues.credits,
  };

  switch (operationId) {
    case OperationType.Credit: {
      finalBalance.credits[creditType]++;
      break;
    }
    case OperationType.Debit: {
      decrementCredits(finalBalance, creditType);
      decrementVisits(operationId, finalBalance, appointmentValues);
      break;
    }
  }
  return finalBalance;
}

async function processBalancesForSubscriptions(
  userValues: UserBalance,
  subValues: SubscriptionValues,
  operationId: OperationType,
): Promise<UserBalance> {
  // const creditType = getData.getCreditTypeFromSubscriptions(subValues.type);

  const finalBalance: UserBalance = {
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

function decrementCredits(finalBalance: UserBalance, creditType: CreditType) {
  finalBalance.credits[creditType]--;
  if (finalBalance.credits[creditType] < 0) {
    finalBalance.credits[creditType] = 0;
  }
}

function decrementVisits(operationId: OperationType, finalBalance: UserBalance, appointmentValues: AppointmentValues) {
  finalBalance.visits -= appointmentValues.visitCost;
  if (finalBalance.visits < 0) {
    finalBalance.visits = 0;
  }
}


