const firebaseFunctions = require("firebase-functions");
module.exports = () =>
firebaseFunctions.https.onRequest(async (req: any, res: any) => {
    try {
      const {
        id,
        uid,
        expert,
        appointmentTypeID,
        // visits = req.body.visits ? req.body.visits : 0,
      } = req.body;
      const { credits } = await firebaseFetch(
        "appointmnetTypes",
        appointmentTypeID
      );
      const userData = await firebaseFetch("users", uid);
      const document = admin.firestore().collection("appointments").doc(uid);
      const response = await document.get();
      let appointments = response.data();

      appointments.history = appointments.history.filter(
        (item: any) => item.id !== id
      );

      await document.set(
        { history: [...(appointments.history || [])] },
        { merge: true }
      );

      await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .update({
          visits:
            (userData.visits && userData.visits != "NaN"
              ? userData.visits
              : 0) + credits,
        });

      const expertDocument = admin
        .firestore()
        .collection("appointments")
        .doc(expert.uid);
      const expertResponse = await expertDocument.get();
      let expertAppointments = expertResponse.data();
      let filtered = expertAppointments.history[uid].filter((item: any) => {
        return item.id !== id ? item : false;
      });

      await expertDocument.set(
        { history: { [uid]: [...(filtered || [])] } },
        { merge: true }
      );
    } catch (error) {
      console.log("Cancel Error", error);
      return error;
    }
  });
