
import {firestore} from "firebase-admin";
import {EitherAsync} from "purify-ts";
import {Credits, CreditType, getNewCreditInstance, UserCredits as UserBalance} from "../domain/bll/services/service-pricing";
import {AppointmentType, AppointmentValues, SubscriptionValues} from "./types";
import {PlanCodec, PlanCredits} from "../domain/bll/models/Plan";


export async function getUserValues(uid: string): Promise<UserBalance> {
  const user =
    (await firestore()
      .collection("users")
      .doc(uid)
      .get()).data();

  const creditsObject: Credits = getNewCreditInstance();

  if (user?.credits) {
    Object.entries(user.credits).forEach(([key, value]) => {
      creditsObject[<CreditType>key] = <number>value;
    });
  }

  return {
    credits: creditsObject,
    visits: user?.visits ?? 0,
  };
}

export async function getAppointmentValues(appointmentId: string): Promise<AppointmentValues> {
  const appointmentDoc = await firestore()
    .collection("appointmentTypes")
    .doc(appointmentId)
    .get();

  // Insert Error handle if there was no appointment with valid id. Meaning .data is undefined
  const data = appointmentDoc.data();

  console.log("credits from appointment : " + data?.credits);
  // Insert error handle for if the title or credits field for the appointment is undefined
  // if(!data?.title){return;}

  return {
    type: data?.title.toString(),
    visitCost: data?.credits ?? 0,
  };
}

export function getSubscriptionValues(subId: string): EitherAsync<string, SubscriptionValues> {
  return EitherAsync(async ({liftEither}) => {
    const subDoc = await firestore()
      .collection("plans")
      .doc(subId)
      .get();

    // Insert Error handle if there was no appointment with valid id. Meaning .data is undefined
    const data = subDoc.data();
    const credits: PlanCredits = await liftEither(
      PlanCodec.decode(data).map(value => value.credits),
    );
    // Insert error handle for if the title or credits field for the appointment is undefined
    // if(!data?.title){return;}

    return {credits};
  });
}

export function getCreditTypeForAppointment(appointmentType: AppointmentType): CreditType {
  switch (appointmentType) {
    case AppointmentType.TherapySession: {
      return CreditType.TherapySession;
    }

    case AppointmentType.VideoVisit: {
      return CreditType.VideoVisit;
    }

    case AppointmentType.HealthCheck: {
      return CreditType.HealthCheck;
    }

    default: {
      throw new Error("Invalid Appointment Type passed for Credit Type Mapping");
    }
  }
}
