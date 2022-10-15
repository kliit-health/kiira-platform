import {EitherAsync, intersect, NonEmptyList} from "purify-ts";
import {FirestoreDb} from "../db/firestore-db";
import {AcuitySubscription, AcuitySubscriptionCodec} from "../db/models/AcuitySubscription";
import {Interface, NonEmptyString} from "purify-ts-extra-codec";

export interface KiiraFirestore {
  getUser(byEmail: { email: string }): EitherAsync<string, UserId>;

  getPlan(byTitle: { title: string }): EitherAsync<string, PlanId>;

  addAcuitySubscriptions(by: { userId: string, subs: NonEmptyList<AcuitySubscription> }): EitherAsync<string, void>;

  getAcuitySubscription(byId: { certificateId: string }): EitherAsync<string, { sub: AcuitySubscription, userId: string }>;
}

let firestore: KiiraFirestore | undefined = undefined;

export function createKiiraFirestore(firestoreDb: FirestoreDb): KiiraFirestore {
  if (firestore) return firestore;

  const getUser = ({email}: { email: string }) => {
    return EitherAsync<string, UserId>(async ({liftEither}) => {
      const snapshot = await firestoreDb.collection("users")
        .where("email", "==", email)
        .get();

      const nel = await liftEither(
        NonEmptyList.fromArray(snapshot.docs).toEither(`No users found with email '${email}'`),
      );

      return {userId: NonEmptyList.head(nel).id};
    });
  };

  firestore = {
    getAcuitySubscription({certificateId}: { certificateId: string }): EitherAsync<string, { sub: AcuitySubscription, userId: string }> {
      const codec = intersect(AcuitySubscriptionCodec, Interface({userId: NonEmptyString}));

      return EitherAsync(async ({liftEither, throwE}) => {
        let snapshot: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData> | undefined;
        try {
          snapshot = await firestoreDb.collection("acuitySubscriptions")
            .doc(certificateId)
            .get();
        } catch (e) {
          throwE(`Firebase fetch failed for acuity subscription with id ${certificateId}. Caused by ${JSON.stringify(e)}`);
        }
        const result = await liftEither(codec.decode(snapshot?.data()));
        return {userId: result.userId, sub: result};
      });
    },
    getUser,
    getPlan({title}: { title: string }) {
      return EitherAsync<string, PlanId>(async ({liftEither}) => {
        const snapshot = await firestoreDb.collection("plans")
          .where("acuityTitle", "==", title)
          .get();
        const nel = await liftEither(
          NonEmptyList.fromArray(snapshot.docs).toEither(`No plans found with acuityTitle '${title}'`),
        );
        return {planId: NonEmptyList.head(nel).id};
      });
    },
    addAcuitySubscriptions(
      by: { userId: string, subs: NonEmptyList<AcuitySubscription> },
    ): EitherAsync<string, void> {
      return EitherAsync(async () => {
        const batch = firestoreDb.batch();

        by.subs.forEach(value => {
          const reference = firestoreDb.collection("acuitySubscriptions").doc(value.certificate);
          batch.set(reference, {...value, userId: by.userId}, {merge: true});
        });
        await batch.commit();
      });
    },
  };

  return firestore;
}

export type UserId = {
  readonly userId: string
}
export type PlanId = {
  readonly planId: string
}
// const errorCodec = Interface({status_code: Integer, message: NonEmptyString});
