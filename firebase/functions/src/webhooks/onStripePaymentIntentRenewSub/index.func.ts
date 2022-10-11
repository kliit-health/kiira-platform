import {Context} from "../../ioc";
// import {KiiraSecrets} from "../../onAcuityAppointmentChanged/types";
import {EitherAsync, enumeration, exactly, GetType, NonEmptyList, nonEmptyList, tuple} from "purify-ts";
import {IntegerFromString, Interface, JsonFromString, NonEmptyString} from "purify-ts-extra-codec";
import {Logger} from "../../logging";

const handleRequest = (logger: Logger, body: unknown) =>
  EitherAsync<string, void>(async ({liftEither, throwE}) => {
      const secrets: KiiraSecrets = await liftEither(
        JsonFromString(KiiraSecrets).decode(process.env.KIIRA_SECRETS)
      );
      logger.info("Secrets", secrets);

      const stripeData: StripeData = await liftEither(StripeData.decode(body));
      logger.info("Valid request received.", stripeData);
      const charges: NonEmptyList<Charge> = stripeData.data.object.charges.data;

      const charge: Charge = NonEmptyList.head(charges);
      const nel = await liftEither(
        NonEmptyList.fromArray(charge.description.split("-")).toEither("Unable to split description on '-'")
      );
      const [sub, name, cert] = nel.map(value => value.trim().split(" "));
      logger.info("Valid request received.", {sub, name, cert});

      const [type, id] = await liftEither(
        tuple([enumeration(DescriptionType), IntegerFromString]).decode(sub)
      );
      logger.info("Record", {type, id});

      if (type === DescriptionType.Order) {
        throwE("Payment intent was for an order, not for a subscription");
      }

      const [first, last] = await liftEither(
        tuple([NonEmptyString, NonEmptyString]).decode(name).mapLeft(() => `Name '${name}' is not a valid full name.`)
      );
      logger.info("Name", {first, last});

      // Request cert from acuity using email
      // iterate through results and filter for matching cert field
      // Proceed to credit the user

      return;
    }
  );

module.exports = (context: Context) => {
  const logger = context.logger;
  return context.functions.runWith({secrets: ["KIIRA_SECRETS"]}).https.onRequest(async (request, response) => {
    return handleRequest(logger, request.body)
      .ifLeft(value => console.error("An error occurred:", value))
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
const KiiraSecrets = Interface({
  stripe: Interface({token: NonEmptyString}),
});

type KiiraSecrets = GetType<typeof KiiraSecrets>;

enum DescriptionType {
  Order = "Order", Subscription = "Subscription"
}
