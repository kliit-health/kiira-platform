export interface UpdateValues {
  updatedVisits: number;
  updatedCredits?: Credits;
}

export enum AppointmentType {
  TherapySession = "Therapy Session",
  VideoVisit = "Video Visit",
  HealthCheck = "Health Check"
}

type Credits = {
  [key in AppointmentType]?: number;
}

export interface UserBalance {
  visits: number;
  credits?: Credits;
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
