import * as functions from "firebase-functions";
import * as Acuity from "acuityscheduling";
import {AcuityAppointment, Logger} from "./types";
import {reason} from "./errors";
import {EitherAsync} from "purify-ts";

const acuityClient = authorizedAcuity();

function authorizedAcuity() {
  const acuityCredentials = functions.config().acuity;
  return Acuity.basic({
    userId: acuityCredentials.userid,
    apiKey: acuityCredentials.apikey,
  });
}

export function getAppointmentAsync(id: string, logger: Logger): EitherAsync<Error, AcuityAppointment> {
  return EitherAsync(() => {
    return new Promise((resolve, reject) => {
      logger.info(`Requesting acuity appointment ${id}.`);

      acuityClient.request(`/appointments/${id}`, (e: unknown, response: unknown, appt: AcuityAppointment) => {
        if (e) {
          reject(reason("Appointment request failed.", {appointmentId: id, error: e}));
        } else if (appt.error) {
          reject(reason("Appointment response error.", {appointmentId: id, error: appt.error}));
        } else {
          logger.info("Appointment found.", {appointment: appt});
          resolve(appt);
        }
      });
    });
  });
}
