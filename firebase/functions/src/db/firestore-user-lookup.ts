import {GetType, Maybe, MaybeAsync, optional, string} from "purify-ts";
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
        const decoded = await liftMaybe(codec.decode(data).toMaybe());
        return <UserCredits>({
          visits: decoded.visits,
          credits: decoded.credits,
          orgCredits: orgCredits(decoded),
        });
      });
    },
  };
}

function orgCredits(user: User): number | undefined {
  if (user.organizationId === RedwoodsOrgId) return Infinity;
  if (user.planId === RedwoodsPlanId) return Infinity;
  if (user.plan?.id === RedwoodsPlanId) return Infinity;
  return undefined;
}

const codec = Interface({
  visits: Integer,
  credits: optional(Interface({[CreditType.TherapySession]: Integer})),
  planId: optional(string),
  organizationId: optional(string),
  plan: optional(Interface({id: string})),
});

type User = GetType<typeof codec>

const RedwoodsPlanId = "xYR3EO87hepCAEW7haCC";
const RedwoodsOrgId = "VGzjLjyrD34PwSvJNNO2";
