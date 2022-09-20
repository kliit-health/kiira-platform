const functions = require("firebase-functions");
const moment = require("moment");
const admin = require("firebase-admin");
const appointmentCheckTime = require("../bookAppointment/appointmentCheckTime");
const appointmentMake = require("../bookAppointment/appointmentMake");
const firebaseFetch = require("../utils/firebaseSingleFetch");

module.exports = () =>
  functions.https.onRequest(async (req: any, res: any) => {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ")
    ) {
      res.status(403).send("Unauthorized");
      return;
    }
    let idToken;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      idToken = req.headers.authorization.split("Bearer ")[1];
    } else {
      res.status(403).send("Unauthorized");
      return;
    }
    try {
      const token = await admin.auth().verifyIdToken(idToken);
      if (token) {
        const {
          calendarID,
          time,
          reason,
          prescription,
          uid,
          expert,
          appointmentType,
        } = req.body;

        const { appointmentTypeID } = appointmentType;
        const { firstName, lastName, email } = await firebaseFetch(
          "users",
          uid
        );
        var obj = {
          data: {
            firstName,
            lastName,
            calendarID,
            time,
            email,
            reason,
            prescription,
            appointmentTypeID: appointmentTypeID,
          },
        };

        let response;
        const checkTime = await appointmentCheckTime(obj);
        if (checkTime.valid) {
          const makeAppointment = await appointmentMake(obj);
          response = {
            ...req.body,
            createdAt: moment().unix(),
            expert,
            id: makeAppointment.body.id,
            locked: false,
          };
          const document = admin
            .firestore()
            .collection("appointments")
            .doc(uid);
          const prev = await document.get();
          if (prev.exists) {
            await document.set(
              { history: [...prev.data().history, response] },
              { merge: true }
            );
          } else {
            await admin
              .firestore()
              .collection("appointments")
              .doc(uid)
              .set({ history: [response] });
          }

          const expertDocument = admin
            .firestore()
            .collection("appointments")
            .doc(expert.uid);
          const expertPrev = await expertDocument.get();
          if (expertPrev.exists) {
            await expertDocument.set(
              {
                history: {
                  [uid]: [...(expertPrev.data().history[uid] || []), response],
                },
              },
              { merge: true }
            );
          } else {
            await admin
              .firestore()
              .collection("appointments")
              .doc(expert.uid)
              .set({
                history: { [uid]: [response] },
              });
          }
        }
        return res.sendStatus(200);
      }
    } catch (error) {
      console.error(error);
      return { availible: false };
    }
  });
