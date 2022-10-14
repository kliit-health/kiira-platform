import {extendCodec, Integer, Interface, NonEmptyString} from "purify-ts-extra-codec";
import {Codec, GetType, Left, nonEmptyList, record, Right} from "purify-ts";

const PositiveInteger = extendCodec(Integer, value => {
  return (value > 0) ? Right(value) : Left(`${value} must be positive`);
});

const NonEmptyRecord = <K extends string | number | symbol, V>(keyCodec: Codec<K>, valueCodec: Codec<V>) =>
  extendCodec(record(keyCodec, valueCodec), value => {
      return (Object.keys(value).length > 0) ? Right(value) : Left("Must be not be empty");
    },
  );
export const AcuitySubscriptionCodec = Interface({
  id: PositiveInteger,
  certificate: NonEmptyString,
  productID: PositiveInteger,
  orderID: PositiveInteger,
  name: NonEmptyString,
  email: NonEmptyString,
  expiration: NonEmptyString,
  type: NonEmptyString,
  remainingCounts: NonEmptyRecord(NonEmptyString, PositiveInteger),
  appointmentTypes: NonEmptyRecord(NonEmptyString, NonEmptyString),
  appointmentTypeIDs: nonEmptyList(PositiveInteger),
});

export type AcuitySubscription = GetType<typeof AcuitySubscriptionCodec>;
