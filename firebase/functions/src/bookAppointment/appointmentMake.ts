const functions = require("firebase-functions");
const Acuity = require("acuityscheduling");
const userId = functions.config().acuity.userid;
const apiKey = functions.config().acuity.apikey;

const acuity = Acuity.basic({
  userId: userId,
  apiKey: apiKey,
});

export default module.exports = (props: any) => {
  return new Promise((resolve, reject) =>
    (async function () {
      const { firstName, lastName, email, time, calendarID, notes } =
        props.data;
      try {
        var options = {
          method: "POST",
          body: {
            appointmentTypeID: 16299344,
            datetime: time,
            calendarID: calendarID,
            firstName: firstName,
            lastName: lastName,
            email: email,
            notes: notes,
          },
        };
        await acuity.request(
          "/appointments?admin=true",
          options,
          (err: any, response: any, appointments: any) => {
            resolve(response);
          }
        );
      } catch (error) {
        reject(error);
      }
    })()
  );
};
