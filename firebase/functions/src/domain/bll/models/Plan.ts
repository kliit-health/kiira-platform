import {Integer, Interface, NonEmptyString} from "purify-ts-extra-codec";
import {Codec, enumeration, GetType, Left, nonEmptyList, NonEmptyList, tuple} from "purify-ts";
import {CreditType} from "../services/service-pricing";

const PlanCreditsCodec = Codec.custom<NonEmptyList<[CreditType, number]>>({
  decode: (value: unknown) => {
    const nelCodec = nonEmptyList(tuple([enumeration(CreditType), Integer]));
    if (!value) return Left(`Expected an object, but received ${value}`);
    return nelCodec.decode(Object.entries(<any>value));
  },
  encode: value => value,
});
export type PlanCredits = GetType<typeof PlanCreditsCodec>
export const PlanCodec = Interface({acuityTitle: NonEmptyString, credits: PlanCreditsCodec});
export type Plan = GetType<typeof PlanCodec>;
