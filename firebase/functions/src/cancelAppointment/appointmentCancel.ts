import functions = require("firebase-functions");
import Acuity = require("acuityscheduling");

const userId = functions.config().acuity.userid;
const apiKey = functions.config().acuity.apikey;

const acuity = Acuity.basic({
  userId: userId,
  apiKey: apiKey,
});

export function acuityAppointmentCancel(props: any) {
  return new Promise((resolve, reject) =>
    (async function() {
      const {id} = props.data;
      try {
        const options = {
          method: "PUT",
          body: {
            cancelNote: "Unable to make the appointment!",
          },
        };
        await acuity.request(
          `/appointments/${id}/cancel`,
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
