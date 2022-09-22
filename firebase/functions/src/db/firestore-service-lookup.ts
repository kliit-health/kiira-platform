import {ServiceId, ServiceLookup} from "../core/adapters/service-lookup";
import {Maybe, MaybeAsync} from "purify-ts";
import {CreditType, ServiceCost} from "../core/bll/services/service-pricing";
import {FirestoreDb} from "./firestore-db";
import {Integer} from "purify-ts-extra-codec";

export function firestoreServiceLookup(db: FirestoreDb): ServiceLookup {
  function type(title: string): Maybe<CreditType> {
    switch (title) {
      case "Therapy Session":
        return Maybe.of(CreditType.TherapySession);
      case "Video Visit":
        return Maybe.of(CreditType.VideoVisit);
      case "Health Check":
        return Maybe.of(CreditType.HealthCheck);
      default:
        return Maybe.empty();
    }
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
