const firebaseFunctions = require("firebase-functions");
const firebaseAdmin = require("firebase-admin");
const firebaseSingleFetch = require("../utils/firebaseSingleFetch");
const appointmentCancel = require("../cancelAppointment/appointmentCancel");

module.exports = () =>
  firebaseFunctions.https.onRequest(async (req: any, res: any) => {
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
      const token = await firebaseAdmin.auth().verifyIdToken(idToken);
      if (token) {
        const { id, uid, expert } = req.body;
        const obj = {
          data: {
            id: id,
          },
        };

        return await appointmentCancel(obj)
          .then((res: any) => {
            return res;
          })
          .then(async (res: any) => {
            if (res.body.error) {
              return res.body;
            }

            const document = firebaseAdmin
              .firestore()
              .collection("appointments")
              .doc(uid);
            const response = await document.get();
            let appointments = response.data();
            appointments.history = appointments.history.filter(
              (item: any) => item.id !== id
            );

            await document.set(
              { history: [...(appointments.history || [])] },
              { merge: true }
            );

            const expertDocument = firebaseAdmin
              .firestore()
              .collection("appointments")
              .doc(expert.uid);
            const expertResponse = await expertDocument.get();
            let expertAppointments = expertResponse.data();
            let filtered = expertAppointments.history[uid].filter(
              (item: any) => {
                return item.id !== id ? item : false;
              }
            );

            await expertDocument.set(
              { history: { [uid]: [...(filtered || [])] } },
              { merge: true }
            );
          })
          .catch((error: any) => {
            console.error(error);
          });
      }
      return res.sendStatus(200);
    } catch (error) {
      console.error(error);
      return { availible: false };
    }
  });
