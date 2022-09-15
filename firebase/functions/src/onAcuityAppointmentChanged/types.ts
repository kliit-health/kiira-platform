export interface KiiraSecrets {
  acuity: {
    userid: string,
    apikey: string
  },
  elation: ElationCredentials,
  firebase: {
    storageBucket: string,
    auth: string,
    databaseURL: string,
    locationId: string,
    projectId: string
  },
  interfax: {
    user: string,
    key: string
  },
  messaging: {
    authtoken: string,
    accountsid: string
  },
  paypal: {
    secrect: string,
    secret: string,
    clientid: string
  },
  sendgrid: {
    apikey: string
  },
  stripe: {
    token: string
  },
  twillio: {
    account_sid: string,
    api_key_sid: string,
    api_key_secret: string
  }
}

export interface ElationCredentials {
  readonly grant_type: string;
  readonly username: string;
  readonly password: string;
  readonly client_id: string;
  readonly client_secret: string;
}


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
  readonly forms: [AcuityForm]
}

export type AcuityForm = { readonly id: number, readonly values: [{ fieldID: number, value: string }] }

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
