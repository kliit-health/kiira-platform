import {
  AcuityAppointment,
  AcuityAppointmentId,
  ElationAppointmentId,
  KiiraInvitation,
  KiiraPhysician,
  Logger,
} from "./types";
import * as admin from "firebase-admin";
import {generate as generateId} from "generate-password";
import {error, NoResultsError} from "./errors";
import {Either, EitherAsync, List} from "purify-ts";
import {firestore} from "firebase-admin";
import Firestore = firestore.Firestore;
import WriteResult = firestore.WriteResult;

export function getAppointmentMappingByAcuityId(id: AcuityAppointmentId, logger: Logger): EitherAsync<Error, KiiraAppointment> {
  const findAppointmentById = admin.firestore()
    .collection("appointment")
    .where("acuityId", "==", id)
    .get();

  return EitherAsync<Error, FirestoreResults>(() => findAppointmentById)
    .ifLeft((error) => logger.info("Error getting kiira appointment mapping.", {reason: error}))
    .ifRight(() => logger.info("Checking Kiira appointment id mapping..."))
    .chain(value => EitherAsync.liftEither(getFirstDocumentData(value.docs)))
    .ifLeft(() => logger.info(`No appointment id mapping exists for acuity id ${id}.`))
    .map((value) => <KiiraAppointment>value);
}

type KiiraDocument = {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [field: string]: any;
}

function tryFirestoreRead(firebasePromise: (firestore: Firestore) => Promise<FirestoreResults>): EitherAsync<Error, FirestoreResults> {
  return EitherAsync(() => firebasePromise(admin.firestore()));
}

function tryFirestoreWrite(firebasePromise: (firestore: Firestore) => Promise<WriteResult>): EitherAsync<Error, WriteResult> {
  return EitherAsync(() => firebasePromise(admin.firestore()));
}

function getFirstDocumentData(documents: Array<FirebaseDocument>): Either<Error, KiiraDocument> {
  return List.head(documents)
    .map((document: FirebaseDocument) => ({
      id: document.id,
      ...document.data(),
    }))
    .toEither(new NoResultsError());
}

const kiiraOrgId = "8PnF9LcU8nPdiDSg4vXm";

function tryFirstResult<T>({results, errorMessage}: { results: FirestoreResults, errorMessage: string }) {
  return EitherAsync.liftEither(
    List.head(results.docs)
      .map(value => <T>value.data())
      .toEither(error(errorMessage)),
  );
}

function getInvitation(email: string, logger: Logger): EitherAsync<Error, KiiraInvitation> {
  return tryFirestoreRead((firestore) => {
      logger.info("Looking up invitation in firestore.", {email});
      return firestore.collection("invitations").where("email", "==", email).get();
    },
  )
    .ifRight(value => logger.info("Completed firestore invitation lookup.", {results: value.size}))
    .chain(value =>
      tryFirstResult<KiiraInvitation>({
        results: value,
        errorMessage: `No invitations found for email address '${email}'`,
      }),
    )
    .ifRight(value => logger.info("Invitation found.", value));
}

function createInvitation(appt: AcuityAppointment, logger: Logger): EitherAsync<Error, KiiraInvitation> {
  const id = generateId({length: 24, numbers: true});
  return getFreemiumPlanId(logger)
    .chain(value => tryFirestoreWrite((firestore) => {
      const invitation = invitationFromAppointment(appt, id, value);

      logger.info("Creating firebase invitation.", {invitation});

      return firestore
        .collection("invitations")
        .doc(id)
        .set(invitation, {merge: true});
    }))
    .ifRight(() => logger.info("Firebase invitation created.", {id}))
    .map(() => ({invitationId: id}));
}

type PlanId = string

function getFreemiumPlanId(logger: Logger): EitherAsync<Error, PlanId> {
  return tryFirestoreRead(firestore => {
    logger.info("Firebase plan lookup.");

    return firestore
      .collection("plans")
      .where("title", "==", "Freemium")
      .get();
  })
    .ifRight(value => logger.info("Firebase plan lookup result.", {docs: value.docs}))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .chain(value => tryFirstResult<any>({results: value, errorMessage: "Freemium plan id not found."}))
    .map(value => value.id);
}

function invitationFromAppointment(appt: AcuityAppointment, invitationId: string, planId: string) {
  const {email, firstName, lastName, phone} = appt;
  return {
    invitationId,
    invitationDate: Date.now(),
    role: "subscriber",
    displayName: firstName,
    email,
    organizationId: kiiraOrgId,
    planId,
    firstLogin: true,
    agreeToTerms: false,
    profileInfo: {phoneNumber: phone, firstName, lastName, email},
    status: "Sent", // TODO: change to Processing.
  };
}

export function getPhysicianAsync(calendarId: number, logger: Logger): EitherAsync<Error, KiiraPhysician> {
  return tryFirestoreRead((firestore) => {
    logger.info("Looking up physician in firestore.", {calendarId});
    return firestore
      .collection("users")
      .where("calendarID", "==", calendarId.toString())
      .get();
  })
    .ifRight(value => logger.info("Completed firestore physician lookup.", {results: value.size}))
    .chain(value =>
      tryFirstResult<KiiraPhysician>({
        results: value,
        errorMessage: `Physician with calendar id ${calendarId} does not exist.`,
      }),
    )
    .ifRight(value => logger.info("Physician found.", value));
}

export function getOrCreateInvitationAsync(appt: AcuityAppointment, logger: Logger): EitherAsync<Error, KiiraInvitation> {
  return getInvitation(appt.email, logger).alt(createInvitation(appt, logger));
}

export function createAppointmentMapping(
  acuityId: AcuityAppointmentId,
  elationId: ElationAppointmentId,
): EitherAsync<Error, KiiraAppointment> {
  const promise = admin.firestore()
    .collection("appointment")
    .add({acuityId, elationId});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return EitherAsync<Error, any>(() => promise)
    .map(value => ({id: value.id, acuityId, elationId}));
}

export type KiiraAppointmentId = string

export interface KiiraAppointment {
  id: KiiraAppointmentId;
  acuityId: AcuityAppointmentId;
  elationId: ElationAppointmentId;
}

export type FirestoreResults = FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
export type FirebaseDocument = FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>
