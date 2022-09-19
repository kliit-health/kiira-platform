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
      const { calendarID, time } = props.data;
      try {
        var options = {
          method: "POST",
          body: {
            appointmentTypeID: 16299344,
            datetime: time,
            calendarID: calendarID,
          },
        };
       await acuity.request(`availability/check-times`, options, (err: any, response: any, appointments: any) => {
          resolve(appointments);
        });
        
      } catch (error) {
        reject(error);
      }
    })()
  );
};
