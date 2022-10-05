import {AppointmentType, AppointmentValues, SubscriptionValues,CreditType, UserBalance} from "./types";
import {firestore} from "firebase-admin";


export async function getUserValues(uid: string): Promise<UserBalance> {
  const user =
    (await firestore()
      .collection("users")
      .doc(uid)
      .get()).data();

  const credit: number = user?.credits?.TherapySession;

  return {
    credits: {
      [CreditType.TherapySession]: credit ?? 0,
    },
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

export async function getSubscriptionValues(subId: string): Promise<SubscriptionValues> {
  const subDoc = await firestore()
    .collection("plans")
    .doc(subId)
    .get();
  
  // Insert Error handle if there was no appointment with valid id. Meaning .data is undefined
  const data = subDoc.data();
  const therapyCreds : number = data?.credits[CreditType.TherapySession];
  console.log("credits for the subscription : " + therapyCreds);
  // Insert error handle for if the title or credits field for the appointment is undefined
  // if(!data?.title){return;}

  return {
    credits: data?.credits ?? {[CreditType.TherapySession]:0},
  };
}

export function getCreditTypeForAppointment(appointmentType: AppointmentType): CreditType {
  switch (appointmentType) {
    case AppointmentType.TherapySession: {
      return CreditType.TherapySession;
    }

    case AppointmentType.VideoVisit: {
      return CreditType.TherapySession;
    }

    default: {
      throw new Error("Invalid Appointment Type passed for Credit Type Maping");
    }
  }
}

