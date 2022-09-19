const functions = require("firebase-functions");
const moment = require("moment");
const admin = require("firebase-admin");



module.exports = () =>
  functions.https.onRequest(async (req:any, res:any) => {
    // if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer '))) {
    //     res.status(403).send('Unauthorized');
    //     return;
    //   }

    //   let idToken;
    //   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    //     idToken = req.headers.authorization.split('Bearer ')[1];
    //   } else {
    //     res.status(403).send('Unauthorized');
    //     return;
    //   }
    console.log("functions",functions.functions)
    try {
      //  const token = await admin.auth().verifyIdToken(idToken);
      //  if(token){
      const { firstName, lastName, email, calendarID, time, reason, prescription, uid, expert, appointmentType } =
        req.body;
      let noPrescription = "I do not need a prescription,";
      let yesPrescription = "I need a prescription,";
      let reasonForVisit = `and would like to talk about ${reason}`;

      let notes = prescription ? `${yesPrescription} ${reasonForVisit}` : `${noPrescription} ${reasonForVisit}`;
      const { appointmentTypeID } = appointmentType;

      var obj = {
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          firstName,
          lastName,
          calendarID,
          time,
          email,
          reason,
          prescription,
          notes,
          appointmentTypeID: appointmentTypeID,
        },
      };

      let response;
      const check
    // console.log("chekcTime",addMessage)
      //  const checkTimeUrl = `${constants.dev}/appointmentCheckTime`
      //  let checkTime = await axios.post(checkTimeUrl, obj);
      // const makeAppointmentUrl = `${constants.dev}/appointmentMake`
      // if (checkTime.data.valid) {
      //   const makeAppointmentResponse = await axios.post(makeAppointmentUrl, obj);
      //   response = {
      //     ...req.body,
      //     createdAt: moment().unix(),
      //     expert,
      //     id: makeAppointmentResponse.data.body.id,
      //     locked: false,
      //   };
      //   const document = admin.firestore().collection("appointments").doc(uid);
      //   const prev = await document.get();
      //   if (prev.exists) {
      //     await document.set({ history: [...prev.data().history, response] }, { merge: true });
      //   } else {
      //     await admin
      //       .firestore()
      //       .collection("appointments")
      //       .doc(uid)
      //       .set({ history: [response] });
      //   }

      //   const expertDocument = admin.firestore().collection("appointments").doc(expert.uid);
      //   const expertPrev = await expertDocument.get();
      //   if (expertPrev.exists) {
      //     await expertDocument.set(
      //       {
      //         history: {
      //           [uid]: [...(expertPrev.data().history[uid] || []), response],
      //         },
      //       },
      //       { merge: true }
      //     );
      //   } else {
      //     await admin
      //       .firestore()
      //       .collection("appointments")
      //       .doc(expert.uid)
      //       .set({
      //         history: { [uid]: [response] },
      //       });
      //   }
    // }
        return res.sendStatus(200);
      // }
    } catch (error) {
      console.error(error);
      return { availible: false };
    }
  });