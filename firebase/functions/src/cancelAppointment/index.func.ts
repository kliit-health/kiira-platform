module.exports = () =>
  functions.https.onRequest(async (req:any, res:any) => {
    try {
      const { id, uid, expert, credits, visits = req.body.visits ? req.body.visits : 0} = req.body;
      const userDoc = admin.firestore().collection("users").doc(uid);
      const resData = await userDoc.get();
      let userData = resData.data();
      let amount = req.body.prepaidInfo && req.body.prepaidInfo.amount ? req.body.prepaidInfo.amount : 0;
      let isPrePaid = req.body.prepaidInfo && req.body.prepaidInfo.isPrePaid ? req.body.prepaidInfo.isPrePaid : false;

      const totals = {
        required: credits,
        monthly: userData.visits && userData.visits != "NaN" ? userData.visits : 0,
        purchased: amount,
        availible: 0,
        isPrepaid: isPrePaid,
        redeemPrepaid: 0,
        redeemMonthly: isPrePaid ? (visits > 0 ? visits : 0) : credits - amount,
      };

      const document = admin.firestore().collection("appointments").doc(uid);
      const response = await document.get();
      let appointments = response.data();
      appointments.history = appointments.history.filter((item:any) => item.id !== id);

      await document.set({ history: [...(appointments.history || [])] }, { merge: true });

      await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .update({
          visits: totals.monthly + totals.redeemMonthly,
        });

      const expertDocument = admin.firestore().collection("appointments").doc(expert.uid);
      const expertResponse = await expertDocument.get();
      let expertAppointments = expertResponse.data();
      let filtered = expertAppointments.history[uid].filter((item:any) => {
        return item.id !== id ? item : false;
      });

      await expertDocument.set({ history: { [uid]: [...(filtered || [])] } }, { merge: true });

    } catch (error) {
      console.log("Cancel Error", error);
      return error;
    }
  });
