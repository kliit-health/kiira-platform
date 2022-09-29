import firebaseFunctions = require("firebase-functions");
import firebaseAdmin = require("firebase-admin");
import {acuityAppointmentCancel} from "./appointmentCancel";

function firebaseUserAppointments(uid: string): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  return firebaseAdmin
    .firestore()
    .collection("appointments")
    .doc(uid);
}

function removeAppointmentFromHistory(appointments: FirebaseFirestore.DocumentData, id: any): any {
  return appointments.history.filter(
    (item: any) => item.id !== id,
  );
}

function firebaseUpdateAppointments(document: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, appointments: FirebaseFirestore.DocumentData): Promise<FirebaseFirestore.WriteResult> {
  return document.set(
    {history: [...(appointments.history || [])]},
    {merge: true},
  );
}

function getExpertAppointments(expert: string): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  return firebaseAdmin
    .firestore()
    .collection("appointments")
    .doc(expert);
}

function firebaseUpdateExpertAppointments(expertDocument: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, uid: string, filtered: any): Promise<FirebaseFirestore.WriteResult> {
  return expertDocument.set(
    {history: {[uid]: [...(filtered || [])]}},
    {merge: true},
  );
}

module.exports = () =>
  firebaseFunctions.https.onRequest(async (req: any, res: any) => {
    let idToken;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      idToken = req.headers.authorization.split("Bearer ")[1];
    } else {
      res.status(401).send("Unauthorized");
      return;
    }
    try {
      const token = await firebaseAdmin.auth().verifyIdToken(idToken);
      if (token) {
        const {id, expertUid} = req.body;
        const uid: string = token.uid;
        const obj = {data: {id}};

        return await acuityAppointmentCancel(obj)
          .then((res: any) => {
            return res;
          })
          .then(async (res: any) => {
            if (res.body.error) {
              return res.body;
            }

            const document = firebaseUserAppointments(uid);
            const response = await document.get();
            const appointments = response.data();
            if (appointments) {
              appointments.history = removeAppointmentFromHistory(appointments, id);
              await firebaseUpdateAppointments(document, appointments);
            }

            const expertDocument = getExpertAppointments(expertUid);
            const expertResponse = await expertDocument.get();
            const expertAppointments = expertResponse.data() ?? {};
            const filtered = expertAppointments.history[uid].filter(
              (item: any) => {
                return item.id !== id ? item : false;
              },
            );

            await firebaseUpdateExpertAppointments(expertDocument, uid, filtered);
          })
          .catch((error: any) => {
            console.error(error);
          });
      }
      return res.sendStatus(200);
    } catch (error) {
      console.error(error);
      return {available: false};
    }
  });
