export interface UpdateValues {

  updatedVisits: number;
  updatedCredits: number;

}

export enum OperationType {

  Credit = "Credit",
  Debit = "Debit"

}

export enum TransactionType {

  Appointment = "Appointment",
  None = ""

}
