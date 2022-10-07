import {ServiceId, ServiceLookup} from "../core/adapters/service-lookup";
import {enumeration, Maybe, MaybeAsync} from "purify-ts";
import {CreditType, ServiceCost} from "../core/bll/services/service-pricing";
import {FirestoreDb} from "./firestore-db";
import {Integer} from "purify-ts-extra-codec";

export function firestoreServiceLookup(db: FirestoreDb): ServiceLookup {
  function type(title: string): Maybe<CreditType> {
    const enumString = title.replace(/\s/g, "");
    return enumeration(CreditType).decode(enumString).toMaybe();
  }

  function getCreditInfo(id: string) {
    return db.collection("appointmentTypes")
      .doc(id)
      .get();
  }

  return {
    cost(id: ServiceId): MaybeAsync<ServiceCost> {
      return MaybeAsync(async ({liftMaybe}) => {
        const snapshot = await getCreditInfo(id);
        const data = await liftMaybe(Maybe.fromNullable(snapshot.data()));
        const creditType = await liftMaybe(type(data.title));
        const credits = await liftMaybe(Integer.decode(data.credits).toMaybe());
        return <ServiceCost>{
          type: creditType,
          costInVisitCredits: credits,
        };
      });
    },
  };
}
