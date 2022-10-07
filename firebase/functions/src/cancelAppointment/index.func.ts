import firebaseFunctions = require("firebase-functions");
import firebaseAdmin = require("firebase-admin");
import {acuityAppointmentCancel} from "./appointmentCancel";
import {OperationType, TransactionType} from "../creditsProcessing/types";
import {processCreditsAndVisits} from "../creditsProcessing/util";

function firebaseUserAppointments(uid: string): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  return firebaseAdmin
    .firestore()
    .collection("appointments")
    .doc(uid);
}

function removeAppointmentFromHistory(appointments: FirebaseFirestore.DocumentData, id: any): any {
  let removed = undefined;
  const filtered: any = appointments.history.filter(
    (item: any) => {
      const predicate: boolean = item.id != id;
      if (!predicate) {
        removed = item;
      }
      return predicate;
    },
  );
  return {removed, filtered};
}

function firebaseUpdateAppointments(
  document: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
  appointments: FirebaseFirestore.DocumentData,
): Promise<FirebaseFirestore.WriteResult> {
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

function firebaseUpdateExpertAppointments(
  expertDocument: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
  uid: string,
  filtered: any,
): Promise<FirebaseFirestore.WriteResult> {
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
        const {patientId, appointmentId, expertId} = req.body;
        const obj = {data: {appointmentId}};

        await acuityAppointmentCancel(obj)
          .then(async (acuityResponse: any) => {
            const acuityResponseBody = acuityResponse.body;
            if (acuityResponseBody.error) {
              res.status(200).send({response: acuityResponseBody});
              return acuityResponseBody;
            }

            const document = firebaseUserAppointments(patientId);
            const snapshot = await document.get();
            const appointments = snapshot.data();
            if (appointments) {
              const {removed, filtered}: any = removeAppointmentFromHistory(appointments, appointmentId);
              appointments.history = filtered;
              await firebaseUpdateAppointments(document, appointments);
              await processCreditsAndVisits(
                patientId,
                TransactionType.Appointment,
                removed.appointmentType.id,
                OperationType.Credit,
              );
            }

            const expertDocument = getExpertAppointments(expertId);
            const expertResponse = await expertDocument.get();
            const expertAppointments = expertResponse.data() ?? {};
            const filtered = expertAppointments.history[patientId].filter(
              (item: any) => {
                return item.id !== appointmentId ? item : false;
              },
            );

            await firebaseUpdateExpertAppointments(expertDocument, patientId, filtered);
            res.sendStatus(200);
          })
          .catch((error: any) => {
            console.error(error);
            res.status(200).send({error: error.message, available: false});
          });
        return;
      }
      res.sendStatus(401);
      return;
    } catch (error) {
      console.error(error);
      res.status(200).send({error, available: false});
      return;
    }
  });
