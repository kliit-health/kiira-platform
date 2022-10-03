export interface UpdateValues {
  updatedVisits: number;
  updatedCredits?: Credits;
}

export enum AppointmentType {
  TherapySession = "Therapy Session",
  VideoVisit = "Video Visit",
  HealthCheck = "Health Check"
}
export enum CreditType {
  
  TherapySession = "Mental Health",
}


export type Credits = {
  //For later forms of scalability
  //[key in AppointmentType]?: number;
  MentalHealth : number;
}

export interface UserBalance {
  visits: number;
  credits: Credits;
}

export interface AppointmentValues {
  readonly type: AppointmentType,
  readonly visitCost: number;
}

export enum OperationType {
  Credit = "Credit",
  Debit = "Debit"
}

export enum TransactionType {
  Appointment = "Appointment",
  None = ""
}
