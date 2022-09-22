import {Context} from "../ioc";
import {servicePricing} from "../core/bll/services/service-pricing";
import {firestoreUserLookup} from "../db/firestore-user-lookup";
import {firestoreServiceLookup} from "../db/firestore-service-lookup";
import {Maybe, MaybeAsync, NonEmptyList} from "purify-ts";
import * as admin from "firebase-admin";
import {auth} from "firebase-admin";
import DecodedIdToken = auth.DecodedIdToken;

module.exports = (context: Context) => {
  const userLookup = firestoreUserLookup(context.firestore);
  const serviceLookup = firestoreServiceLookup(context.firestore);
  return context.functions.https.onRequest(async (req, res) => {
    const idToken: DecodedIdToken | undefined = (await decodeToken(req.headers.authorization)).extract();
    if (!idToken) {
      res.sendStatus(401);
      return;
    }

    const result = await MaybeAsync(async ({fromPromise, liftMaybe}) => {
      const appointmentTypeId = await liftMaybe(
        Maybe.fromNullable(req.body.appointmentTypeId)
          .ifNothing(() => badRequest("No appointment id provided")),
      );
      const credits = await fromPromise(
        userLookup.credits(idToken.uid)
          .ifNothing(() => badRequest("Couldn't fetch user")),
      );
      const cost = await fromPromise(
        serviceLookup.cost(appointmentTypeId)
          .ifNothing(() => badRequest("Couldn't fetch appointment type")),
      );
      return servicePricing(credits, cost);
    });

    result.caseOf({
      Just: value => {
        res.status(200).send(value);
      },
      Nothing: () => badRequest(),
    });

    function badRequest(message?: string) {
      if (message != null) {
        context.logger.info(message);
        res.status(400).send({error: message});
        return;
      }
      res.sendStatus(400);
    }
  });
};

function decodeToken(authorization: string | undefined): MaybeAsync<DecodedIdToken> {
  const idToken = getIdToken(authorization);

  return MaybeAsync(async ({liftMaybe}) => {
    return admin.auth().verifyIdToken(await liftMaybe(idToken));
  });
}

function getIdToken(authorization: string | undefined): Maybe<string> {
  return Maybe.fromNullable(authorization)
    .filter(value => value.startsWith("Bearer"))
    .map(value => value.split(" "))
    .chain(value => NonEmptyList.fromArray(value))
    .map(value => NonEmptyList.last(value));
}
