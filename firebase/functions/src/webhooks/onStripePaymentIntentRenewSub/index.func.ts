import {Context} from "../../ioc";
import {Either, EitherAsync, enumeration, exactly, GetType, NonEmptyList, nonEmptyList, string, tuple} from "purify-ts";
import {IntegerFromString, Interface, NonEmptyString} from "purify-ts-extra-codec";
import {Logger} from "../../logging";
import {AcuityClient} from "../../di/acuity";
import {KiiraFirestore} from "../../di/kiiraFirestore";
import {updateCreditBalance} from "../../creditsProcessing/util";
import {OperationType, TransactionType} from "../../creditsProcessing/types";
import {AcuitySubscriptionCodec} from "../../db/models/AcuitySubscription";

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

function warnIfMultipleSubsArePresent(subCount: number, orderId: number): void {
  if (subCount > 1) {
    console.warn(
      `The number of subscriptions in orderId '${orderId}' was ${subCount}, only the first entry was processed.`,
    );
  }
}

async function createSubscriptions(acuity: AcuityClient, orderId: number, firestore: KiiraFirestore) {
  return EitherAsync<string, void>(async ({fromPromise, liftEither}) => {
    const sourceSubs = await fromPromise(
      acuity.getSubscriptions({orderId}),
    );

    warnIfMultipleSubsArePresent(sourceSubs.length, orderId);

    const sourceSub = NonEmptyList.head(sourceSubs);
    const {userId} = await fromPromise(
      firestore.getUser({email: sourceSub.email}),
    );

    const {planId} = await fromPromise(
      firestore.getPlan({title: sourceSub.name}),
    );
    const sub = await liftEither(AcuitySubscriptionCodec.decode({...sourceSub, userId, planId}));
    const subs = NonEmptyList.unsafeCoerce([sub]);

    await fromPromise(firestore.addAcuitySubscriptions({subs}));
  });
}

async function getSubscription(firestore: KiiraFirestore, certificate: string) {
  return EitherAsync<string, { userId: string, planId: string }>(async ({fromPromise}) => {
    const {planId, userId} = await fromPromise(
      firestore.getAcuitySubscription({certificateId: certificate}),
    );

    return {userId, planId};
  });
}

const handleRequest = (logger: Logger, body: unknown, acuity: AcuityClient, firestore: KiiraFirestore) =>
  EitherAsync<string, void>(async ({liftEither, throwE, fromPromise}) => {
      const stripeData: StripeData = await liftEither(
        parseStripeBody(body),
      );

      const charge: Charge = getSubscriptionCharge(stripeData);
      const {type, id, cert: certificate} = await fromPromise(tokenizeChargeDescription(charge));

      if (type === DescriptionType.Order) {
        if (certificate === "Subscription") {
          await fromPromise(createSubscriptions(acuity, id, firestore));
          return;
        }
        throwE("Payment intent was for an order, not for a subscription");
      }

      const {userId, planId} = await fromPromise(getSubscription(firestore, certificate));

      await fromPromise(
        updateCreditBalance(userId, TransactionType.SubscriptionRecurrence, planId, OperationType.Credit)
          .mapLeft(value =>
            throwE(`Call to processCreditsAndVisits failed with the following error -> ${value}`),
          ),
      );

      return;
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

const StripeData = Interface({
  type: exactly("payment_intent.succeeded"),
  data: Interface({object: PaymentIntent}),
});
type StripeData = GetType<typeof StripeData>

enum DescriptionType {
  Order = "Order", Subscription = "Subscription"
}
