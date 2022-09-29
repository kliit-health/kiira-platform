import moment = require("moment");
import admin = require("firebase-admin");
import {acuityCheckAppointmentAvailability, CheckAvailability} from "./appointmentCheckTime";
import {acuityBookAppointment} from "./appointmentMake";
import {firebaseSingleFetch} from "../utils/firebaseSingleFetch";
import {Context} from "../ioc";
import {DateFromAny, Interface, NonEmptyString} from "purify-ts-extra-codec";
import {boolean, GetType, optional, string} from "purify-ts";

const BookingRequest = Interface({
  time: DateFromAny,
  notes: optional(string),
  reason: NonEmptyString,
  prescription: boolean,
  expertId: NonEmptyString,
  appointmentTypeId: NonEmptyString,
});

type BookingRequest = GetType<typeof BookingRequest>

async function updateExpertAppointments(expertDocument: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, uid: any, expertData: FirebaseFirestore.DocumentData, response: any): Promise<void> {
  await expertDocument.set(
    {
      history: {
        [uid]: [...(expertData.history[uid] || []), response],
      },
    },
    {merge: true},
  );
}

function initializeExpertAppointments(expertId: any, uid: any, response: any): Promise<FirebaseFirestore.WriteResult> {
  return admin
    .firestore()
    .collection("appointments")
    .doc(expertId)
    .set({
      history: {[uid]: [response]},
    });
}

function getFirebaseUserAppointments(uid: any): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  return admin
    .firestore()
    .collection("appointments")
    .doc(uid);
}

function getFirebaseExpertAppointments(expertId: any): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  return admin
    .firestore()
    .collection("appointments")
    .doc(expertId);
}

function updateFirebaseUserAppointments(document: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, data: FirebaseFirestore.DocumentData, response: any): Promise<FirebaseFirestore.WriteResult> {
  return document.set(
    {history: [...data.history, response]},
    {merge: true},
  );
}

function initializeFirebaseUserAppointments(uid: any, response: any): Promise<FirebaseFirestore.WriteResult> {
  return getFirebaseUserAppointments(uid)
    .set({history: [response]});
}

async function bookAppointment(props: CheckAvailability, req: any, uid: string, expert: any): Promise<void> {
  const makeAppointment = await acuityBookAppointment(props);
  const response = {
    ...req.body,
    firstName: props.firstName,
    lastName: props.lastName,
    email: props.email,
    createdAt: moment().unix(),
    expert,
    id: makeAppointment.body.id,
    locked: false,
  };
  const document = getFirebaseUserAppointments(uid);
  const prev = await document.get();
  const data = prev.data();
  if (prev.exists && data) {
    await updateFirebaseUserAppointments(document, data, response);
  } else {
    await initializeFirebaseUserAppointments(uid, response);
  }

  const expertDocument = getFirebaseExpertAppointments(expert.uid);
  const expertPrev = await expertDocument.get();
  const expertData: FirebaseFirestore.DocumentData | undefined = expertPrev.data();
  if (expertPrev.exists && expertData) {
    await updateExpertAppointments(expertDocument, uid, expertData, response);
  } else {
    await initializeExpertAppointments(expert.uid, uid, response);
  }
}

async function getFirebaseUser(uid: string): Promise<any> {
  return await firebaseSingleFetch("users", uid);
}

module.exports = (context: Context) =>
  context.functions.https.onRequest(async (req: any, res: any) => {
    let idToken;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      idToken = req.headers.authorization.split("Bearer ")[1];
    } else {
      res.sendStatus(401).send("Unauthorized");
      return;
    }
    try {
      const token = await admin.auth().verifyIdToken(idToken);
      const uid: string = token.uid;
      if (token) {
        const decoded = BookingRequest.decode(req.body);
        if (decoded.isLeft()) {
          res.status(400).send({error: decoded.leftOrDefault("")});
          return;
        }
        const {time, reason, prescription, expertId, appointmentTypeId} = decoded.unsafeCoerce();

        const {profileInfo: {firstName, lastName, email}} = await getFirebaseUser(uid);
        const expert = await getFirebaseUser(expertId);
        const appointmentType = await firebaseSingleFetch("appointmentTypes", appointmentTypeId);
        const availabilityQuery: CheckAvailability = {
          firstName,
          lastName,
          calendarId: expert.calendarId,
          time: time.toISOString(),
          email,
          reason,
          prescription,
          appointmentTypeID: appointmentType.appointmentTypeID,
        };

        const checkTime = await acuityCheckAppointmentAvailability(availabilityQuery);
        if (checkTime.valid) {
          await bookAppointment(availabilityQuery, req, uid, expert);
        } else {
          res.status(200).send({error: checkTime.error});
          return;
        }
        return res.sendStatus(200);
      } else {
        res.sendStatus(401).send("Unauthorized");
      }
    } catch (error) {
      console.error(error);
      res.sendStatus(401);
      return {available: false};
    }
  });
