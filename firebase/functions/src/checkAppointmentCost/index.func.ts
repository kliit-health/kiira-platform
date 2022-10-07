import {Context} from "../ioc";
import {PricingInfo, servicePricing} from "../core/bll/services/service-pricing";
import {firestoreUserLookup} from "../db/firestore-user-lookup";
import {firestoreServiceLookup} from "../db/firestore-service-lookup";
import {EitherAsync, Maybe, MaybeAsync, NonEmptyList} from "purify-ts";
import * as admin from "firebase-admin";
import {auth} from "firebase-admin";
import DecodedIdToken = auth.DecodedIdToken;

module.exports = (context: Context) => {
  const userLookup = firestoreUserLookup(context.firestore);
  const serviceLookup = firestoreServiceLookup(context.firestore);
  return context.functions.https.onRequest(async (req, res) => {
    context.logger.info("request body", req.body);
    const idToken: DecodedIdToken | undefined = (await decodeToken(req.headers.authorization)).extract();
    if (!idToken) {
      res.sendStatus(401);
      return;
    }

    const result = await EitherAsync<string, PricingInfo>(async ({fromPromise, liftEither}) => {
      const appointmentTypeId = await liftEither(
        Maybe.fromNullable(req.body.appointmentTypeId).toEither("No appointment id provided"),
      );
      const credits = await fromPromise(
        userLookup.credits(idToken.uid).toEitherAsync("Couldn't fetch user"),
      );
      const cost = await fromPromise(
        serviceLookup.cost(appointmentTypeId).toEitherAsync("Couldn't fetch appointment type"),
      );
      return servicePricing(credits, cost);
    });

    result.caseOf({
      Right: value => {
        context.logger.info("success", value);
        res.status(200).send(value);
      },
      Left: (errorMessage: string) => badRequest(errorMessage),
    });

    function badRequest(message: string) {
      context.logger.info("Bad request", {error: message});
      res.status(400).send({error: message});
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
