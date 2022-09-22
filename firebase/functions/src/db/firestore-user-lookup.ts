import {Maybe, MaybeAsync, optional} from "purify-ts";
import {CreditType, UserCredits} from "../core/bll/services/service-pricing";
import {FirestoreDb} from "./firestore-db";
import {UserId, UserLookup} from "../core/adapters/user-lookup";
import {Integer, Interface} from "purify-ts-extra-codec";

export function firestoreUserLookup(db: FirestoreDb): UserLookup {
  async function fetchUser(id: UserId) {
    const query = db.collection("users").doc(id);
    return await query.get();
  }

  return {
    credits(id: UserId): MaybeAsync<UserCredits> {
      return MaybeAsync(async ({liftMaybe}) => {
        const userSnapshot = await fetchUser(id);
        const data = await liftMaybe(Maybe.fromNullable(userSnapshot.data()));
        const maybeDecoded = codec.decode(data).toMaybe();
        return <UserCredits>(await liftMaybe(maybeDecoded));
      });
    },
  };
}

const codec = Interface({
  visits: Integer,
  credits: optional(Interface({[CreditType.TherapySession]: Integer})),
});
