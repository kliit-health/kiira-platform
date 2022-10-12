import {EitherAsync} from "purify-ts";

export interface KiiraFirestore {
  getUserByEmail(byEmail: { email: string }): EitherAsync<string, { uid: string }>;
  getUserByUid(byUid: { uid: string }): EitherAsync<string, { user: unknown }>;

  getPlan(byTitle: { title: string }): EitherAsync<string, { planId: string }>;
}

let firestore: KiiraFirestore | undefined = undefined;

export function createKiiraFirestore(): KiiraFirestore {
  if (firestore) return firestore;

  firestore = <KiiraFirestore>{
    getUserByEmail(byEmail: { email: string }): EitherAsync<string, { uid: string }> {
      return EitherAsync(async helpers => {
        return helpers.throwE("Not yet implemented: getUserIdByEmail");
      });
    },
    getUserByUid(byUid: { uid: string }): EitherAsync<string, { user: unknown }> {
      return EitherAsync(async helpers => {
        return helpers.throwE("Not yet implemented: getUserIdByEmail");
      });
    },

    getPlan(byTitle: { title: string }): EitherAsync<string, { planId: string }> {
      return EitherAsync(async helpers => {
        return helpers.throwE("Not yet implemented: getUserIdByEmail");
      });
    },


  };

  return firestore;
}

// const errorCodec = Interface({status_code: Integer, message: NonEmptyString});
