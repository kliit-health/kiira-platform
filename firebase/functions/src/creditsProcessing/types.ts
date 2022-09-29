export interface UpdateValues {

  updatedVisits: number;
  updatedCredits: number;

}

export enum OperationTypes {

  Credit = "Credit",
  Debit = "Debit"

}

export enum AppointmentTypes {

  Appointment = "Appointment",
  None = ""

}
