import {Context} from "../../ioc";
import {Either, EitherAsync, enumeration, exactly, GetType, NonEmptyList, nonEmptyList, string, tuple} from "purify-ts";
import {IntegerFromString, Interface, NonEmptyString} from "purify-ts-extra-codec";
import {Logger} from "../../logging";
import {AcuityClient} from "../../di/acuity";
import {KiiraFirestore} from "../../di/kiiraFirestore";

function tokenizeChargeDescription(charge: Charge): EitherAsync<string, { firstName: string; lastName: string; cert: string; id: number; type: DescriptionType }> {
  const tokenizationCodec = tuple([
    enumeration(DescriptionType),
    IntegerFromString,
    NonEmptyString,
    NonEmptyString,
    NonEmptyString,
  ]);

  return EitherAsync(async ({liftEither}) => {
    const tokenizedByDash: NonEmptyList<string> =
      await liftEither(nonEmptyList(string).decode(charge.description.split("-")));
    const tokenizedBySpace: string[] =
      tokenizedByDash.flatMap(value => value.trim().split(" "));
    const [type, id, firstName, lastName, cert] =
      await liftEither(tokenizationCodec.decode(tokenizedBySpace));
    return {type, id, firstName, lastName, cert};
  });
}


function parseStripeBody(body: unknown): Either<string, StripeData> {
  return StripeData.decode(body);
}

function getSubscriptionCharge(stripeData: StripeData): Charge {
  return NonEmptyList.head(stripeData.data.object.charges.data);
}

function renewSubscriptionForUser(userId: string, planId: string): EitherAsync<string, void> {
  return EitherAsync<string, void>(async helpers => {
    return helpers.throwE("Not yet implemented");
  }).void();
}

const handleRequest = (logger: Logger, body: unknown, acuity: AcuityClient, firestore: KiiraFirestore) =>
  EitherAsync<string, void>(async ({liftEither, throwE, fromPromise}) => {
      const stripeData: StripeData = await liftEither(
        parseStripeBody(body),
      );
      logger.info("Valid request received.", stripeData);

      const charge: Charge = getSubscriptionCharge(stripeData);
      const {type, cert: certificate} = await fromPromise(
        tokenizeChargeDescription(charge),
      );

      if (type === DescriptionType.Order) {
        throwE("Payment intent was for an order, not for a subscription");
      }

      const email: string = charge.billing_details.email;
      const {name} = await fromPromise(
        acuity.getProduct({email, certificate}),
      );
      const {userId} = await fromPromise(
        firestore.getUser({email}),
      );
      const {planId} = await fromPromise(
        firestore.getPlan({title: name}),
      );
      return fromPromise(renewSubscriptionForUser(userId, planId));
    },
  );

module.exports = (context: Context) => {
  const logger: Logger = context.logger;
  return context.functions.runWith({secrets: ["KIIRA_SECRETS"]}).https.onRequest(async (request, response) => {
    const acuity: AcuityClient = context.acuity();
    const kiiraFirestore: KiiraFirestore = context.kiiraFirestore();
    return handleRequest(logger, request.body, acuity, kiiraFirestore)
      .ifLeft(value => logger.error(value))
      .caseOf<void>({_: () => response.sendStatus(200)});
  });
};

const Charge = Interface({
  description: NonEmptyString,
  billing_details: Interface({
    email: NonEmptyString,
    name: NonEmptyString,
  }),
});
type Charge = GetType<typeof Charge>


const PaymentIntent = Interface({
  metadata: Interface({
    source: exactly("Acuity Scheduling"),
  }),
  charges: Interface({
    data: nonEmptyList(Charge),
  }),
});
type PaymentIntent = GetType<typeof PaymentIntent>

const StripeData = Interface({
  type: exactly("payment_intent.succeeded"),
  data: Interface({object: PaymentIntent}),
});
type StripeData = GetType<typeof StripeData>

enum DescriptionType {
  Order = "Order", Subscription = "Subscription"
}
