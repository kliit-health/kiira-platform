import {
  AcuityAppointment,
  ElationAppointment,
  ElationAppointmentId,
  ElationAuth,
  ElationCredentials,
  ElationEmail,
  ElationPatient,
  ElationPhysician,
  AcuityForm,
  KiiraInvitation,
  KiiraPhysician,
  Logger,
} from "./types";
import {AxiosError, AxiosResponse, default as axios} from "axios";
import {Either, EitherAsync, List, Maybe, NonEmptyList} from "purify-ts";
import {error} from "./errors";

const ELATION_BASE_URL = "https://sandbox.elationemr.com/api/2.0";
const ELATION_OAUTH_URL = `${ELATION_BASE_URL}/oauth2/token/`;
const ELATION_PATIENTS_URL = `${ELATION_BASE_URL}/patients/`;
const ELATION_PHYSICIANS_URL = `${ELATION_BASE_URL}/physicians/`;
const ELATION_APPOINTMENTS_URL = `${ELATION_BASE_URL}/appointments/`;

function axiosPromiseAsEitherAsync(axiosPromise: () => Promise<AxiosResponse>): EitherAsync<Error, AxiosResponse> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return EitherAsync<AxiosError<any>, AxiosResponse>(axiosPromise)
    .mapLeft(({message, response}) => error(
        JSON.stringify({message, body: response?.data}, null, 2),
      ),
    );
}


function createPatient(
  auth: ElationAuth,
  invitation: KiiraInvitation,
  appointment: AcuityAppointment,
  physician: ElationPhysician,
  logger: Logger,
): EitherAsync<Error, ElationPatient> {
  const dateString = List.find((form: AcuityForm) => form.id === 2131591)(appointment.forms)
    .map(form => form.values)
    .chain(List.find(field => field.fieldID === 11897600))
    .map(field => field.value)
    .orDefault("1900-01-01");

  return EitherAsync(async ({fromPromise}) => {
    const patient = {
      first_name: appointment.firstName,
      last_name: appointment.lastName,
      dob: new Date(dateString),
      sex: "Unknown",
      primary_physician: physician.id,
      caregiver_practice: physician.practice,
      address: {
        address_line1: "",
      },
      phones: [{phone: appointment.phone, phone_type: "Main"}],
      emails: [{email: appointment.email}],
      metadata: {
        data: {
          invitationId: invitation.invitationId,
        },
      },
    };

    logger.info("Creating elation patient.", {
      email: appointment.email,
      invitationId: invitation.invitationId,
    });

    const {data} = await fromPromise(
      axiosPromiseAsEitherAsync(() => axios.post(
          ELATION_PATIENTS_URL,
          patient,
          {
            headers: {
              "Accept": "application/json",
              ...authorizationHeader(auth),
            },
          },
        ),
      ),
    );

    logger.info("Elation patient created.", {data});

    return Promise.resolve({id: data.id, emails: [{email: appointment.email}]});
  });
}

function matchByInvitationId(results: [ElationPatient], id: string): ElationPatient | undefined {
  return results.find((patient) =>
    patient.metadata?.data?.invitationId === id,
  );
}

function matchByEmail(results: [ElationPatient], email: string): ElationPatient | undefined {
  const matchingEmail = (elationEmail: ElationEmail) => elationEmail.email === email;

  return results.find((patient) =>
    patient.emails.find(matchingEmail) !== undefined,
  );
}

function getPatient(
  auth: ElationAuth,
  firstName: string,
  lastName: string,
  email: string,
  id: string,
  logger: Logger,
): EitherAsync<Error, ElationPatient> {
  return EitherAsync<Error, ElationPatient>(async ({fromPromise, liftEither}) => {
      const config = {
        params: {first_name: firstName, last_name: lastName},
        headers: {
          "Accept": "application/json",
          ...authorizationHeader(auth),
        },
      };

      logger.info("Looking up elation patient.", {invitationId: id});
      const {data} = await fromPromise(
        axiosPromiseAsEitherAsync(() => axios.get(ELATION_PATIENTS_URL, config)),
      );
      logger.info("Completed elation patient lookup.", {results: data.count});

      const results: [ElationPatient] = data.results.filter((value: ElationPatient) => !value.deleted_date);
      const matchEither = Maybe.fromFalsy<ElationPatient>(matchByEmail(results, email))
        .alt(Maybe.fromFalsy(matchByInvitationId(results, id)))
        .toEither(error("Found existing patient with matching first and last name but neither email nor invitation id match."))
        .ifRight(value => logger.info("Patient found.", value));

      return liftEither(matchEither);
    },
  );
}

type PhysicianName = { first_name: string } | { last_name: string } | { first_name: string, last_name: string }

function getPhysician(
  auth: ElationAuth,
  logger: Logger,
  name: PhysicianName,
): EitherAsync<Error, ElationPhysician> {
  const filter = name;
  const config = {
    params: name,
    headers: {
      "Accept": "application/json",
      ...authorizationHeader(auth),
    },
  };

  return axiosPromiseAsEitherAsync(() => {
    logger.info("Looking up elation physician.", {filter});
    return axios.get(ELATION_PHYSICIANS_URL, config);
  })
    .ifRight(({data}) => logger.info("Completed elation physician lookup.", {results: data.count}))
    .map(({data}) => <[ElationPhysician]>data.results)
    .map(value => List.head(value))
    .chain(maybe => EitherAsync.liftEither(
      maybe.toEither(error(`No physicians matching ${name}`)),
    ))
    .ifRight(value => logger.info("Elation physician found.", value));
}

function postAppointment(auth: ElationAuth, elationAppt: ElationAppointment, logger: Logger): EitherAsync<Error, ElationAppointmentId> {
  const config = headers(auth);

  return axiosPromiseAsEitherAsync(() => {
    logger.info("Creating elation appointment.", {appt: elationAppt});
    return axios.post(ELATION_APPOINTMENTS_URL, elationAppt, config);
  })
    .ifRight(({data}) => logger.info("Elation appointment created.", {result: data}))
    .map(({data}) => data.id);
}

function authenticate(credentials: ElationCredentials, logger: Logger): EitherAsync<Error, ElationAuth> {
  const body = new URLSearchParams({...credentials});
  const config = {
    headers: {"Content-type": "application/x-www-form-urlencoded"},
  };

  return axiosPromiseAsEitherAsync(() => {
    logger.info("Authenticating Elation...");
    return axios.post(ELATION_OAUTH_URL, body, config);
  }).map(({data}) => data)
    .ifRight(() => logger.info("Authenticated successfully."));
}


function authorizationHeader(auth: ElationAuth) {
  return {
    "Authorization": `${auth.token_type} ${auth.access_token}`,
  };
}

function getOrCreatePatient(
  auth: ElationAuth,
  firstName: string,
  lastName: string,
  invitation: KiiraInvitation,
  appt: AcuityAppointment,
  physician: ElationPhysician,
  logger: Logger,
): EitherAsync<Error, ElationPatient> {
  return getPatient(auth, firstName, lastName, appt.email, invitation.invitationId, logger)
    .alt(createPatient(auth, invitation, appt, physician, logger));
}

function patchAppointmentTime(id: ElationAppointmentId, datetime: string) {
  return (auth: ElationAuth) => {
    const config = headers(auth);
    const promise = axios.patch(ELATION_APPOINTMENTS_URL + `/${id}`, {scheduled_date: new Date(datetime)}, config);
    return EitherAsync<Error, unknown>(() => promise).void();
  };
}

function patchAppointmentCancelled(id: ElationAppointmentId) {
  return (auth: ElationAuth) => {
    const config = headers(auth);
    const promise = axios.patch(ELATION_APPOINTMENTS_URL + `/${id}`, {status: {status: "Cancelled"}}, config);
    return EitherAsync<Error, unknown>(() => promise).void();
  };
}

function headers(auth: ElationAuth) {
  return {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...authorizationHeader(auth),
    },
  };
}

type Name = string

function getPhysicianName(expertName: string): Either<Error, NonEmptyList<Name>> {
  return NonEmptyList.fromArray(expertName.split(" "))
    .filter(nameList => nameList.length > 1)
    .toEither(error(`Expert name '${expertName}' was not valid.`));
}

export class ElationApi {
  credentials: ElationCredentials;
  logger: Logger;
  elationAuth?: ElationAuth;

  constructor(credentials: ElationCredentials, logger: Logger) {
    this.credentials = credentials;
    this.logger = logger;
  }

  authorize(): EitherAsync<Error, ElationAuth> {
    return EitherAsync(async ({fromPromise}) => {
      if (this.elationAuth) {
        return this.elationAuth;
      }

      return fromPromise(
        authenticate(this.credentials, this.logger)
          .ifRight(value => this.elationAuth = value),
      );
    });
  }

  createAppointmentAsync(
    appt: AcuityAppointment,
    invitation: KiiraInvitation,
    physician: ElationPhysician,
    logger: Logger,
  ): EitherAsync<Error, ElationAppointmentId> {
    return EitherAsync(async ({fromPromise}) => {
      const {firstName, lastName} = appt;

      const auth = await fromPromise(this.authorize());
      const patient = await fromPromise(
        getOrCreatePatient(auth, firstName, lastName, invitation, appt, physician, this.logger),
      );

      const elationAppt: ElationAppointment = {
        scheduled_date: new Date(appt.datetime),
        patient: patient.id,
        physician: physician.id,
        practice: physician.practice,
        duration: parseInt(appt.duration),
        reason: "Check intake form.",
      };
      return fromPromise(postAppointment(auth, elationAppt, logger));
    });
  }

  getPhysicianAsync(appt: AcuityAppointment, physician: KiiraPhysician): EitherAsync<Error, ElationPhysician> {
    return EitherAsync(async ({fromPromise, liftEither}) => {
      const auth = await fromPromise(this.authorize());
      const expertName: NonEmptyList<Name> = await liftEither(getPhysicianName(physician.expertName));

      const firstName = NonEmptyList.head(expertName);
      const lastName = NonEmptyList.last(expertName);

      return fromPromise(getPhysician(auth, this.logger, {first_name: firstName, last_name: lastName}));
    });
  }

  updateAppointmentAsync(elationId: ElationAppointmentId, datetime: string): EitherAsync<Error, void> {
    return this.authorize().chain(patchAppointmentTime(elationId, datetime));
  }

  cancelAppointmentAsync(elationId: ElationAppointmentId): EitherAsync<Error, void> {
    return this.authorize().chain(patchAppointmentCancelled(elationId));
  }
}
