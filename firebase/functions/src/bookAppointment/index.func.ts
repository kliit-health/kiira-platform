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

async function bookAppointment(check: CheckAvailability, appointmentType: any, patient: any, expert: any): Promise<void> {
  const makeAppointment = await acuityBookAppointment(check);
  const newAppointmentEntry = {
    appointmentType,
    calendarID: expert.calendarID,
    complete: false,
    dob: patient.profileInfo.dob,
    email: check.email,
    firstName: check.firstName,
    lastName: check.lastName,
    gender: patient.profileInfo.gender,
    insurance: patient.profileInfo.insurance,
    organizationId: patient.organizationId,
    phoneNumber: patient.profileInfo.phoneNumber,
    plan: patient.plan,
    prepaid: false,
    prescription: check.prescription,
    profile: patient.profileInfo.profileImageUrl,
    pronouns: patient.profileInfo.pronouns,
    reason: check.reason,
    time: check.time,
    uid: patient.uid,
    createdAt: moment().unix(),
    expert: {
      firstName: expert.profileInfo.firstName,
      lastName: expert.profileInfo.lastName,
      imageUrl: expert.profileInfo.profileImageUrl,
      profession: expert.profileInfo.profession,
      rating: expert.rating,
      uid: expert.uid,
    },
    id: makeAppointment.body.id,
    locked: false,
  };
  const document = getFirebaseUserAppointments(patient.uid);
  const prev = await document.get();
  const data = prev.data();
  if (prev.exists && data) {
    await updateFirebaseUserAppointments(document, data, newAppointmentEntry);
  } else {
    await initializeFirebaseUserAppointments(patient.uid, newAppointmentEntry);
  }

  const expertDocument = getFirebaseExpertAppointments(expert.uid);
  const expertPrev = await expertDocument.get();
  const expertData: FirebaseFirestore.DocumentData | undefined = expertPrev.data();
  if (expertPrev.exists && expertData) {
    await updateExpertAppointments(expertDocument, patient.uid, expertData, newAppointmentEntry);
  } else {
    await initializeExpertAppointments(expert.uid, patient.uid, newAppointmentEntry);
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

        const patient: any = await getFirebaseUser(uid);
        const {profileInfo: {firstName, lastName, email}} = patient;
        const expert = await getFirebaseUser(expertId);
        const appointmentType = await firebaseSingleFetch("appointmentTypes", appointmentTypeId);
        const availabilityQuery: CheckAvailability = {
          firstName,
          lastName,
          calendarId: expert.calendarID,
          time: time.toISOString(),
          email,
          reason,
          prescription,
          appointmentTypeID: appointmentType.appointmentTypeID,
        };

        const checkTime = await acuityCheckAppointmentAvailability(availabilityQuery);
        if (checkTime.valid) {
          await bookAppointment(availabilityQuery, appointmentType, patient, expert);
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
