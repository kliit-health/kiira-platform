import {EitherAsync, NonEmptyList} from "purify-ts";
import {FirestoreDb} from "../db/firestore-db";
import {AcuitySubscription} from "../db/models/AcuitySubscription";

export interface KiiraFirestore {
  getUser(byEmail: { email: string }): EitherAsync<string, UserId>;

  getPlan(byTitle: { title: string }): EitherAsync<string, PlanId>;

  addAcuitySubscriptions(nel: NonEmptyList<AcuitySubscription>): EitherAsync<string, void>;
}

let firestore: KiiraFirestore | undefined = undefined;

export function createKiiraFirestore(firestoreDb: FirestoreDb): KiiraFirestore {
  if (firestore) return firestore;

  firestore = {
    getUser({email}: { email: string }) {
      return EitherAsync<string, UserId>(async ({liftEither}) => {
        const snapshot = await firestoreDb.collection("users")
          .where("email", "==", email)
          .get();

        const nel = await liftEither(
          NonEmptyList.fromArray(snapshot.docs).toEither(`No users found with email '${email}'`),
        );

        return {userId: NonEmptyList.head(nel).id};
      });
    },
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
    addAcuitySubscriptions(nel: NonEmptyList<AcuitySubscription>): EitherAsync<string, void> {
      return EitherAsync(async ({throwE, fromPromise}) => {
        const asyncs: NonEmptyList<EitherAsync<unknown, FirebaseFirestore.WriteResult>> = nel.map(value => {
          return EitherAsync(async () => {
            return await firestoreDb.collection("acuitySubscriptions")
              .doc(value.certificate)
              .set(value, {merge: true});
          });
        });
        const errors = await EitherAsync.lefts(asyncs);
        if (errors.length !== 0) {
          throwE(JSON.stringify(errors));
        }
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
