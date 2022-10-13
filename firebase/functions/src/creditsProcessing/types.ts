import {PlanCredits} from "../domain/bll/models/Plan";


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
  readonly credits: PlanCredits;
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

