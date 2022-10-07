import functions = require("firebase-functions");
import Acuity = require("acuityscheduling");

const userId = functions.config().acuity.userid;
const apiKey = functions.config().acuity.apikey;

const acuity = Acuity.basic({
  userId: userId,
  apiKey: apiKey,
});


export function acuityBookAppointment(props: any): Promise<any> {
  return new Promise((resolve, reject) =>
    (async function() {
      const {
        firstName,
        lastName,
        email,
        time,
        calendarID,
        appointmentTypeID,
      } = props;
      try {
        const options = {
          method: "POST",
          body: {
            appointmentTypeID,
            datetime: time,
            calendarID: calendarID,
            firstName: firstName,
            lastName: lastName,
            email: email,
          },
        };
        await acuity.request(
          "/appointments?admin=true",
          options,
          (err: any, response: any, appointments: any) => {
            resolve(response);
          },
        );
      } catch (error) {
        reject(error);
      }
    })(),
  );
}
