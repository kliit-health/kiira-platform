import {enumeration, GetType, Maybe, MaybeAsync, optional, record, string} from "purify-ts";
import {CreditType, OrganizationCredits, UserCredits} from "../domain/bll/services/service-pricing";
import {FirestoreDb} from "./firestore-db";
import {UserId, UserLookup} from "../domain/adapters/user-lookup";
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
        return {
          visits: decoded.visits,
          credits: decoded.credits,
          orgCredits: orgCredits(decoded),
        };
      });
    },
  };
}

function orgCredits(user: User): OrganizationCredits | undefined {
  const unlimitedVisits: OrganizationCredits | undefined = {visits: Infinity};
  if (user.organizationId === RedwoodsOrgId) return unlimitedVisits;
  if (user.planId === RedwoodsPlanId) return unlimitedVisits;
  if (user.plan?.id === RedwoodsPlanId) return unlimitedVisits;
  return undefined;
}

const codec = Interface({
  visits: Integer,
  credits: record(enumeration(CreditType), Integer),
  planId: optional(string),
  organizationId: optional(string),
  plan: optional(Interface({id: string})),
});

type User = GetType<typeof codec>

const RedwoodsPlanId = "xYR3EO87hepCAEW7haCC";
const RedwoodsOrgId = "VGzjLjyrD34PwSvJNNO2";
