import {Interface, JsonFromString, NonEmptyString} from "purify-ts-extra-codec";
import {Either, GetType, Left} from "purify-ts";

const KiiraSecrets = Interface({
  stripe: Interface({token: NonEmptyString}),
  acuity: Interface({
    userid: NonEmptyString,
    apikey: NonEmptyString,
  }),
});

export type KiiraSecrets = GetType<typeof KiiraSecrets>;

export function getSecrets(): Either<string, KiiraSecrets> {
  const input: unknown = process.env.KIIRA_SECRETS;
  if (input) {
    return JsonFromString(KiiraSecrets).decode(input);
  } else {
    return Left("process.env.KIIRA_SECRETS has not been initialized.");
  }
}
