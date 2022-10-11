export enum AppointmentType {
  TherapySession = "Therapy Session",
  VideoVisit = "Video Visit",
  HealthCheck = "Health Check"
}

export interface AppointmentValues {
  readonly type: AppointmentType,
  readonly visitCost: number;
}

export enum CreditType {
  HealthCheck = "HealthCheck",
  VideoVisit = "VideoVisit",
  TherapySession = "TherapySession",
}

export type Credits = {
  [key in CreditType]: number;
};


export interface SubscriptionValues {
  readonly credits: Credits;
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
  None = "",
  Renewal = "Renewal"
}


export type OrganizationCredits = {
  readonly visits: number
}

