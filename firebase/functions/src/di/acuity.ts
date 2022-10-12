import {EitherAsync} from "purify-ts";

export interface KiiraFirestore {
  getUser(byEmail: { email: string }): EitherAsync<string, { uid: string }>;

  getPlan(byTitle: { title: string }): EitherAsync<string, { planId: string }>;
}

let firestore: KiiraFirestore | undefined = undefined;

export function createKiiraFirestore(): KiiraFirestore {
  if (firestore) return firestore;

  firestore = <KiiraFirestore>{
    getUser(byEmail: { email: string }): EitherAsync<string, { uid: string }> {
    },
    getPlan(byTitle: { title: string }): EitherAsync<string, { planId: string }> {
    },
  };

  return firestore;
}

// const errorCodec = Interface({status_code: Integer, message: NonEmptyString});
