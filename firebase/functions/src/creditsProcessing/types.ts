import {
   Credits,
} from "../domain/bll/services/service-pricing";


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

export enum OperationType {
  Credit = "Credit",
  Debit = "Debit"
}

export enum TransactionType {
  Appointment = "Appointment",
  Subscription = "Subscription",
  None = ""
}


export type OrganizationCredits = {
  readonly visits: number
}

