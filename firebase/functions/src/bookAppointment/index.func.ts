import moment = require("moment");
import admin = require("firebase-admin");
import {acuityCheckAppointmentAvailability, Appointment} from "./appointmentCheckTime";
import {acuityBookAppointment} from "./appointmentMake";
import {firebaseSingleFetch} from "../utils/firebaseSingleFetch";
import {Context} from "../ioc";
import {Interface, NonEmptyString} from "purify-ts-extra-codec";
import {GetType, optional, string} from "purify-ts";
import {OperationType, TransactionType} from "../creditsProcessing/types";
import {processCreditsAndVisits} from "../creditsProcessing/util";

const BookingRequest = Interface({
  time: NonEmptyString,
  notes: optional(string),
  reason: NonEmptyString,
  expertId: NonEmptyString,
  appointmentTypeId: NonEmptyString,
});

type BookingRequest = GetType<typeof BookingRequest>

async function updateExpertAppointments(
  expertDocument: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
  uid: any,
  expertData: FirebaseFirestore.DocumentData,
  appointmentData: any,
): Promise<void> {
  await expertDocument.set(
    {
      history: {
        [uid]: [...(expertData.history[uid] || []), appointmentData],
      },
    },
    {merge: true},
  );
}

function initializeExpertAppointments(
  expertId: any,
  uid: any,
  appointmentData: any,
): Promise<FirebaseFirestore.WriteResult> {
  return admin
    .firestore()
    .collection("appointments")
    .doc(expertId)
    .set({
      history: {[uid]: [appointmentData]},
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

function updateFirebaseUserAppointments(
  document: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
  data: FirebaseFirestore.DocumentData,
  appointmentData: any,
): Promise<FirebaseFirestore.WriteResult> {
  return document.set(
    {history: [...data.history, appointmentData]},
    {merge: true},
  );
}

function initializeFirebaseUserAppointments(uid: any, appointmentData: any): Promise<FirebaseFirestore.WriteResult> {
  return getFirebaseUserAppointments(uid)
    .set({history: [appointmentData]});
}

function createAppointmentFields(appointment: Appointment) {
  const {reason, time} = appointment;
  return {reason, time};
}

function createExpertFields(expert: any) {
  const {
    uid,
    rating,
    calendarID,
    profileInfo: {firstName, lastName, profileImageUrl, profession},
  } = expert;
  return {
    calendarID,
    expert: {
      firstName,
      lastName,
      imageUrl: profileImageUrl,
      profession: profession.shortName,
      rating,
      uid,
    },
  };
}

function createPatientFields(patient: any) {
  const {uid, profileInfo, plan, organizationId} = patient;
  const {email, dob, firstName, lastName, gender, insurance, phoneNumber, profileImageUrl, pronouns} = profileInfo;
  return {
    email,
    dob,
    firstName,
    lastName,
    gender,
    insurance,
    organizationId,
    phoneNumber,
    plan,
    profile: profileImageUrl,
    pronouns,
    uid,
  };
}

function firestoreAppointmentEntry(
  appointmentType: any,
  patient: any,
  expert: any,
  appointment: Appointment,
  appointmentId: string,
) {
  return {
    appointmentType,
    ...createPatientFields(patient),
    ...createExpertFields(expert),
    ...createAppointmentFields(appointment),
    complete: false,
    prepaid: false,
    createdAt: moment().unix(),
    id: appointmentId,
    locked: false,
  };
}

async function bookAppointment(
  appointment: Appointment,
  appointmentType: any,
  patient: any,
  expert: any,
): Promise<void> {
  const acuityAppointmentId = (await acuityBookAppointment(appointment)).body.id;
  const newAppointmentEntry = firestoreAppointmentEntry(
    appointmentType,
    patient,
    expert,
    appointment,
    acuityAppointmentId,
  );

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

function createAppointment(patient: any, expert: any, booking: BookingRequest, appointmentType: any) {
  const {time, reason} = booking;
  const {profileInfo: {firstName, lastName, email}} = patient;
  return {
    firstName,
    lastName,
    calendarId: expert.calendarID,
    time,
    email,
    reason,
    appointmentTypeID: appointmentType.appointmentTypeID,
  };
}

module.exports = (context: Context) => {
  const flog = context.logger;
  return context.functions.https.onRequest(async (req: any, res: any) => {
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
          const message: string = decoded.leftOrDefault("");
          flog.info(message);
          res.status(400).send({error: message});
          return;
        }
        const booking: BookingRequest = decoded.unsafeCoerce();
        const {expertId, appointmentTypeId} = booking;

        const patient = await getFirebaseUser(uid);
        const expert = await getFirebaseUser(expertId);
        const appointmentType = await firebaseSingleFetch("appointmentTypes", appointmentTypeId);
        const availabilityQuery: Appointment = createAppointment(patient, expert, booking, appointmentType);

        const checkTime = await acuityCheckAppointmentAvailability(availabilityQuery);
        if (checkTime.valid) {
          await bookAppointment(availabilityQuery, appointmentType, patient, expert);
          await processCreditsAndVisits(uid, TransactionType.Appointment, appointmentTypeId, OperationType.Debit);
          res.sendStatus(200);
        } else {
          res.status(200).send({error: checkTime.error});
        }
      } else {
        res.sendStatus(401).send("Unauthorized");
      }
    } catch (error) {
      console.error(error);
      res.sendStatus(401);
      return;
    }
  });
};
