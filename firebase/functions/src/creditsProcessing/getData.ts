import {UserBalance,TransactionType,AppointmentValues, AppointmentType, OperationType,CreditType} from "./types";
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
      [CreditType.TherapySession]: credit ?? 0
    },

    visits: user?.visits ?? 0,
  };
}

export async function getAppointmentValuesFromType(transactionType: TransactionType, transactionId: string) {
  let appointmentVal: AppointmentValues;

  switch (transactionType) {
    case TransactionType.Appointment: {
      appointmentVal = await getAppointmentValues(transactionId);
      break;
    }
    default: {
      appointmentVal = {
        type: AppointmentType.HealthCheck,
        visitCost: 0
      };

      console.log("Invalid transactionType given!");
      break;
    }
  }
  return appointmentVal;
}

export async function getAppointmentValues(appointmentId: string): Promise<AppointmentValues> {
  const appointmentDoc = await firestore()
    .collection("appointmentTypes")
    .doc(appointmentId)
    .get();

  // Insert Error handle if there was no appointment with valid id. Meaning .data is undefined
  const data = appointmentDoc.data();

  console.log("credits from appointment : " + data?.credits);
  //Insert error handle for if the title or credits field for the appointment is undefined
  //if(!data?.title){return;}
  
  return {
    type: data?.title.toString(),
    visitCost: data?.credits ?? 0,
  };
}

export async function getOperationFromId(opId: OperationType): Promise<number> {
  switch (opId) {
    case OperationType.Credit: {
      return 1;
    }
    case OperationType.Debit: {
      return -1;
    }
    default: {
      console.log("Invalid transactionType given!");
      throw new Error("Invalid transactionType given!");
    }
  }
}
export async function getCreditsForAppointmentType(user:UserBalance,appointmentType:AppointmentType) : Promise<number>{
  

  return user.credits[getCreditTypeForAppointment(appointmentType)] ?? 0;
}

export function getCreditTypeForAppointment(appointmentType:AppointmentType) : CreditType{
  
switch(appointmentType){

  case AppointmentType.TherapySession:
    {

      return CreditType.TherapySession;
    }
  
    case AppointmentType.VideoVisit:
      {
  
        return CreditType.TherapySession;
      }

      default:
        {
          throw new Error("Invalid Appointment Type passed for Credit Type Maping");

        }



}

}