import * as functions from "firebase-functions";
import {AcuityAppointment, AcuityAppointmentId, ElationAppointmentId, KiiraSecrets, Logger} from "./types";
import {ElationApi} from "./elation";
import * as kiira from "./kiira";
import * as acuity from "./acuity";
import {EitherAsync} from "purify-ts";
import {AxiosError} from "axios";
import {error} from "./errors";
import * as crypto from "crypto";

const logger = <Logger>{
  info(message: string, data?: unknown): void {
    if (data) {
      functions.logger.log(message, data);
    } else {
      functions.logger.log(message);
    }
  },
};


// noinspection JSUnusedGlobalSymbols
export const onAcuityAppointmentChanged = functions.runWith({secrets: ["KIIRA_SECRETS"]}).https.onRequest(
  async (request, response) => {
    const secrets = <KiiraSecrets>JSON.parse(<string>process.env.KIIRA_SECRETS);
    const elation = new ElationApi(secrets.elation, logger);

    if (!verifyWebhookRequest(secrets, request)) {
      logger.info("Hash check failed.");
      response.sendStatus(401);
      return;
    }

    const body = request.body;
    logger.info("Valid request received.", body);
    const {id, action} = body;

    const result = await acuity.getAppointmentAsync(secrets, id, logger)
      .chain(value => syncAppointmentToElation(elation, action, value))
      .ifLeft(error => logger.info("Sync to elation failed.", {reason: error.message}))
      .run();

    return result.caseOf<void>({_: () => response.status(200).send()});
  });

function verifyWebhookRequest(secrets: KiiraSecrets, request: functions.https.Request): boolean {
  const providedHash = request.header("X-Acuity-Signature");
  const hasher = crypto.createHmac("sha256", secrets.acuity.apikey);
  hasher.update(request.rawBody.toString());

  const calculatedHash = hasher.digest("base64");
  return calculatedHash === providedHash;
}

function syncAppointmentToElation(elation: ElationApi, action: string, appt: AcuityAppointment): EitherAsync<Error, void> {
  switch (action) {
    case "appointment.scheduled":
    case "scheduled":
      return createAppointmentAsync(elation, appt);
    case "appointment.canceled":
    case "canceled":
      return cancelAppointmentAsync(elation, appt.id);
    case "appointment.rescheduled":
    case "rescheduled":
      return updateAppointmentAsync(elation, appt.id, appt.datetime);
    default:
      return EitherAsync(({throwE}) => throwE(error(`The '${action}' action is not supported.`)));
  }
}

function createAppointmentAsync(elation: ElationApi, appt: AcuityAppointment): EitherAsync<Error, void> {
  return createElationAppointmentAsync(elation, appt)
    .ifRight(value => logger.info(`Elation appointment id is ${value}`))
    .ifLeft(error => logger.info("Failed after appointment create", error))
    .chain(elationId => kiira.createAppointmentMapping(appt.id, elationId))
    .void();
}

function updateAppointmentAsync(elation: ElationApi, id: AcuityAppointmentId, datetime: string): EitherAsync<Error, void> {
  return getKiiraAppointmentMappingAsync(id)
    .chain(value => elation.updateAppointmentAsync(value.elationId, datetime))
    .ifRight(() => logger.info("Elation appointment rescheduled successfully."))
    .ifLeft(error => {
      const axErr = <AxiosError>error;
      logger.info("Failed to reschedule appointment", {error: axErr.response?.statusText});
      return;
    });
}

function cancelAppointmentAsync(elation: ElationApi, id: AcuityAppointmentId): EitherAsync<Error, void> {
  return getKiiraAppointmentMappingAsync(id)
    .chain(value => elation.cancelAppointmentAsync(value.elationId))
    .ifRight(() => logger.info(`Elation appointment ${id} cancelled successfully.`))
    .ifLeft(error => {
      const axErr = <AxiosError>error;
      logger.info("Failed to cancel appointment", {error: axErr.response?.statusText});
      return;
    });
}

function createElationAppointmentAsync(elation: ElationApi, appt: AcuityAppointment): EitherAsync<Error, ElationAppointmentId> {
  return EitherAsync(async ({fromPromise}) => {
      const invitation = await fromPromise(kiira.getOrCreateInvitationAsync(appt, logger));
      const physician = await fromPromise(getPhysicianAsync(elation, appt));
      return fromPromise(elation.createAppointmentAsync(appt, invitation, physician, logger));
    },
  );
}

function getPhysicianAsync(elation: ElationApi, appt: AcuityAppointment) {
  return kiira.getPhysicianAsync(appt.calendarID, logger)
    .chain(value => elation.getPhysicianAsync(appt, value));
}

function getKiiraAppointmentMappingAsync(id: AcuityAppointmentId) {
  return kiira.getAppointmentMappingByAcuityId(id, logger)
    .ifRight(value => logger.info("Acuity appointment id mapping found.", {ids: value}));
}
