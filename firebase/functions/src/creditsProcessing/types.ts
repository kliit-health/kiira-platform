export enum AppointmentType {
  TherapySession = "Therapy Session",
  VideoVisit = "Video Visit",
  HealthCheck = "Health Check"
}

export interface AppointmentValues {
  readonly type: AppointmentType,
  readonly visitCost: number;
}


export interface SubscriptionValues {
  readonly credits: Credits;
}


export enum CreditType {
  VideoVisit = "VideoVisit",
  TherapySession = "TherapySession",
}

export type Credits = {
  // For later forms of scalability
  [key in CreditType]: number;
  // MentalHealth : number;
}

export interface UserBalance {
  readonly visits: number;
  readonly credits: Credits;
}


export enum OperationType {
  Credit = "Credit",
  Debit = "Debit"
}

export enum TransactionType {
  Appointment = "Appointment",
  Subscription = "Subscription",
  None = ""
}
