import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {
  AcuityAppointment, AcuityAppointmentId,
  ElationAppointmentId,
  Logger,
} from "./types";
import {ElationApi, ElationCredentials} from "./elation";
import * as kiira from "./kiira";
import * as acuity from "./acuity";
import {EitherAsync} from "purify-ts";
import {AxiosError} from "axios";
import {error} from "./errors";

admin.initializeApp();
const logger = <Logger>{
  info(message: string, data?: unknown): void {
    if (data) {
      functions.logger.log(message, data);
    } else {
      functions.logger.log(message);
    }
  },
};
const elation = new ElationApi(elationCredentials(), logger);

// noinspection JSUnusedGlobalSymbols
export const onAcuityAppointmentChanged = functions.https.onRequest(async (request, response) => {
  const body = request.body;
  logger.info("Begin execution.", body);

  const {id, action} = body;

  const result = await acuity.getAppointmentAsync(id, logger)
    .chain(value => syncAppointmentToElation(action, value))
    .ifLeft(error => logger.info("Sync to elation failed.", {reason: error.message}))
    .run();

  return result.caseOf<void>({_: () => response.status(200).send()});
});


function syncAppointmentToElation(action: string, appt: AcuityAppointment): EitherAsync<Error, void> {
  switch (action) {
    case "appointment.scheduled":
    case "scheduled":
      return createAppointmentAsync(appt);
    case "appointment.canceled":
    case "canceled":
      return cancelAppointmentAsync(appt.id);
    case "appointment.rescheduled":
    case "rescheduled":
      return updateAppointmentAsync(appt.id, appt.datetime);
    default:
      return EitherAsync(({throwE}) => throwE(error(`The '${action}' action is not supported.`)));
  }
}

function createAppointmentAsync(appt: AcuityAppointment): EitherAsync<Error, void> {
  return createElationAppointmentAsync(appt)
    .ifRight(value => logger.info(`Elation appointment id is ${value}`))
    .ifLeft(error => logger.info("Failed after appointment create", error))
    .chain(elationId => kiira.createAppointmentMapping(appt.id, elationId))
    .void();
}

function updateAppointmentAsync(id: AcuityAppointmentId, datetime: string): EitherAsync<Error, void> {
  return getKiiraAppointmentMappingAsync(id)
    .chain(value => elation.updateAppointmentAsync(value.elationId, datetime))
    .ifRight(() => logger.info("Elation appointment rescheduled successfully."))
    .ifLeft(error => {
      const axErr = <AxiosError>error;
      logger.info("Failed to reschedule appointment", {error: axErr.response?.statusText});
      return;
    });
}

function cancelAppointmentAsync(id: AcuityAppointmentId): EitherAsync<Error, void> {
  return getKiiraAppointmentMappingAsync(id)
    .chain(value => elation.cancelAppointmentAsync(value.elationId))
    .ifRight(() => logger.info(`Elation appointment ${id} cancelled successfully.`))
    .ifLeft(error => {
      const axErr = <AxiosError>error;
      logger.info("Failed to cancel appointment", {error: axErr.response?.statusText});
      return;
    });
}

function createElationAppointmentAsync(appt: AcuityAppointment): EitherAsync<Error, ElationAppointmentId> {
  return EitherAsync(async ({fromPromise}) => {
      const invitation = await fromPromise(kiira.getOrCreateInvitationAsync(appt, logger));
      const physician = await fromPromise(getPhysicianAsync(appt));
      return fromPromise(elation.createAppointmentAsync(appt, invitation, physician, logger));
    },
  );
}

function getPhysicianAsync(appt: AcuityAppointment) {
  return kiira.getPhysicianAsync(appt.calendarID, logger)
    .chain(value => elation.getPhysicianAsync(appt, value));
}

function getKiiraAppointmentMappingAsync(id: AcuityAppointmentId) {
  return kiira.getAppointmentMappingByAcuityId(id, logger)
    .ifRight(value => logger.info("Acuity appointment id mapping found.", {ids: value}));
}

function elationCredentials(): ElationCredentials {
  return {
    grant_type: "password",
    username: "2670-424@api.elationemr.com",
    password: "a739a9bc963c4f7afaa18b037288c622",
    client_id: "KNnT7QvNbkw9SZJ4rq1MextX4jjxVThaj6ls7PsJ",
    client_secret: "x6Byf2GUYtxNYChgRTZQwX0kM2eBM8VLYkXkSGi1qlRA7YdeBqcBRkGwm3ycYzCg4X2PsEtMv0ANDHjxXSCV100ylW5nTE9FMTjxEbLuT8ZuIlcQZYzHEvBVFdnfqQ1M",
  };
}
