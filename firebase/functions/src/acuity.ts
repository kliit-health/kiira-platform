import * as Acuity from "acuityscheduling";
import {AcuityAppointment, KiiraSecrets, Logger} from "./types";
import {reason} from "./errors";
import {EitherAsync} from "purify-ts";


function authorizedAcuity(secrets: KiiraSecrets) {
  return Acuity.basic({
    userId: secrets.acuity.userid,
    apiKey: secrets.acuity.apikey,
  });
}

export function getAppointmentAsync(secrets: KiiraSecrets, id: string, logger: Logger): EitherAsync<Error, AcuityAppointment> {
  return EitherAsync(() => {
    return new Promise((resolve, reject) => {
      logger.info(`Requesting acuity appointment ${id}.`);

      authorizedAcuity(secrets).request(`/appointments/${id}`, (e: unknown, response: unknown, appt: AcuityAppointment) => {
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
