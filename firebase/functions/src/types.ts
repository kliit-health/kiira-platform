export interface RejectionReason {
  readonly message: string;
  readonly data?: unknown;
}

export type AcuityAppointmentId = number;
export type ElationAppointmentId = number;

export interface AcuityAppointment {
  readonly id: AcuityAppointmentId;
  readonly calendarID: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string;
  readonly datetime: string;
  readonly duration: string;
  readonly error?: string;
}

export interface ElationAppointment {
  readonly scheduled_date: Date,
  readonly reason: string,
  readonly duration: number;
  readonly patient: string,
  readonly physician: string,
  readonly practice: string,
  readonly service_location?: number;
}

export interface ElationAuth {
  readonly access_token: string;
  readonly expires_in: number;
  readonly token_type: string;
  readonly scope: string;
  readonly refresh_token: string;
}

export interface KiiraInvitation {
  readonly invitationId: string;
}

export interface ElationEmail {
  email: string;
}

export interface ElationPatient {
  readonly id: string;
  readonly deleted_date?: string;
  readonly emails: [ElationEmail];
  readonly metadata?: {
    readonly data: {
      readonly invitationId: string;
    };
  };
}

export interface ElationPhysician {
  readonly id: string;
  readonly practice: string;
}

export interface KiiraPhysician {
  readonly email: string;
  readonly expertName: string;
}

export interface Logger {
  info(message: string, data?: unknown): void;
}
