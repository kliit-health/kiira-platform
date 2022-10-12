import {Interface, JsonFromString, NonEmptyString} from "purify-ts-extra-codec";
import {Either, GetType} from "purify-ts";

const KiiraSecrets = Interface({
  stripe: Interface({token: NonEmptyString}),
  acuity: Interface({
    userid: NonEmptyString,
    apikey: NonEmptyString,
  }),
});

export type KiiraSecrets = GetType<typeof KiiraSecrets>;

export function getSecrets(): Either<string, KiiraSecrets> {
  return JsonFromString(KiiraSecrets).decode(process.env.KIIRA_SECRETS);
}
