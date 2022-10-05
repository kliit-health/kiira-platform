import {AppointmentType, AppointmentValues, Credits, CreditType, UserBalance} from "./types";
import {firestore} from "firebase-admin";


export async function getUserValues(uid: string): Promise<UserBalance> {
  const user =
    (await firestore()
      .collection("users")
      .doc(uid)
      .get()).data();

  const creditsObject = getNewCreditInstance();

  Object.entries(user?.credits).forEach(([key, value]) => {
    creditsObject[<CreditType>key] = <number>value;
  });

  return {
    credits: <Credits>creditsObject,
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
export function getCreditTypeForAppointment(appointmentType: AppointmentType): CreditType {
  switch (appointmentType) {
    case AppointmentType.TherapySession: {
      return CreditType.TherapySession;
    }

    case AppointmentType.VideoVisit: {
      return CreditType.VideoVisit;
    }

    default: {
      throw new Error("Invalid Appointment Type passed for Credit Type Mapping");
    }
  }
}


function getNewCreditInstance() : Credits {
  const creditsMap : Credits = {
    VideoVisit: 0,
    TherapySession: 0,
  };

  return creditsMap;
}
