import functions = require("firebase-functions");
import Acuity = require("acuityscheduling");

const userId = functions.config().acuity.userid;
const apiKey = functions.config().acuity.apikey;

const acuity = Acuity.basic({
  userId: userId,
  apiKey: apiKey,
});

export interface CheckAvailability {
  readonly firstName: string,
  readonly lastName: string,
  readonly calendarId: number,
  readonly time: string,
  readonly email: string,
  readonly reason: string,
  readonly prescription: boolean,
  readonly appointmentTypeID: number,
}

export function acuityCheckAppointmentAvailability(props: CheckAvailability): Promise<any> {
  return new Promise((resolve, reject) =>
    (async function() {
      const {calendarId, time, appointmentTypeID} = props;
      try {
        const options = {
          method: "POST",
          body: {
            appointmentTypeID,
            datetime: time,
            calendarID: calendarId,
          },
        };
        await acuity.request(
          "availability/check-times",
          options,
          (err: any, response: any, appointments: any) => {
            resolve(appointments);
          },
        );
      } catch (error) {
        reject(error);
      }
    })(),
  );
}
