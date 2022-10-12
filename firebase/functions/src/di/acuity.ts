import {Either, EitherAsync, Left, Right} from "purify-ts";

import {acuityClient} from "acuityscheduling";
import {getSecrets, KiiraSecrets} from "./secrets";

export interface AcuityClient {
  getProduct(byCertificate: { email?: string, certificate: string }): EitherAsync<string, { name: string }>;
}

let acuity: AcuityClient | undefined = undefined;

export function createClient(): AcuityClient {
  if (acuity) return acuity;

  const {acuity: {apikey, userid}}: KiiraSecrets = getSecrets().unsafeCoerce();
  const Acuity = acuityClient.basic({userId: userid, apiKey: apikey});

  acuity = <AcuityClient>{
    getProduct(byCertificate: { email?: string; certificate: string }): EitherAsync<string, { name: string }> {
      return EitherAsync(async helpers => {
        const options = {
          method: "GET",
          body: {},
        };
        const path = "";
        await helpers.fromPromise(request(path, options));

        return helpers.throwE("Not yet implemented");
      });
    },
  };

  function request(path: string, options: unknown): Promise<Either<string, unknown>> {
    return new Promise(resolve => {
      Acuity.request(path, options, (error: Error, response: unknown, body: unknown) => {
        if (error) resolve(Left(error.message));
        resolve(Right(body));
      });
    });
  }

  return acuity;
}
