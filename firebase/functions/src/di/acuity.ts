import {EitherAsync, NonEmptyList, nonEmptyList} from "purify-ts";
import {AxiosError, AxiosResponse, default as axios} from "axios";
import {getSecrets, KiiraSecrets} from "./secrets";
import {Integer, Interface, NonEmptyString} from "purify-ts-extra-codec";
import {SourceAcuitySubscription, SourceAcuitySubscriptionCodec} from "../db/models/AcuitySubscription";

export interface AcuityClient {
  getProduct(byCertificate: { email?: string, certificate: string }): EitherAsync<string, { name: string }>;

  getSubscriptions(param: { orderId: number }): EitherAsync<string, NonEmptyList<SourceAcuitySubscription>>;
}

let acuity: AcuityClient | undefined = undefined;

export function createClient(): AcuityClient {
  if (acuity) return acuity;

  const {acuity: {apikey, userid}}: KiiraSecrets = getSecrets().unsafeCoerce();
  const axiosInstance = axios.create({
    baseURL: "https://acuityscheduling.com/api/v1",
    auth: {username: userid, password: apikey},
  });

  acuity = {
    getSubscriptions(param: { orderId: number }): EitherAsync<string, NonEmptyList<SourceAcuitySubscription>> {
      return EitherAsync(async ({liftEither, throwE}) => {
        let response: AxiosResponse | undefined = undefined;
        try {
          response = await axiosInstance.get("/certificates", {params: {orderID: param.orderId}});
        } catch (e: unknown) {
          const axiosError: AxiosError = <AxiosError>e;
          throwE(`${axiosError.message}, response=${JSON.stringify(axiosError.response?.data)}`);
        }
        return liftEither(
          nonEmptyList(SourceAcuitySubscriptionCodec)
            .decode(response?.data)
            .mapLeft(() => `There were no certificates found for the orderId: ${param.orderId}`),
        );
      });
    },
    getProduct(byCertificate: { email?: string; certificate: string }): EitherAsync<string, { name: string }> {
      const {email, certificate} = byCertificate;
      return EitherAsync(async ({liftEither, throwE}) => {
        let response: AxiosResponse | undefined = undefined;
        try {
          response = await axiosInstance.get("/certificates", {params: {email}});
        } catch (e: unknown) {
          const axiosError: AxiosError = <AxiosError>e;
          throwE(`${axiosError.message}, response=${JSON.stringify(axiosError.response?.data)}`);
        }
        const certificates = await liftEither(
          nonEmptyList(Interface({certificate: NonEmptyString, productID: Integer}))
            .decode(response?.data)
            .mapLeft(() => `AcuityClient#getProduct, there were no certificates found matching ${certificate}`),
        );

        const filtered = certificates.filter(value => value.certificate === certificate);
        const matchingCerts = await liftEither(
          NonEmptyList.fromArray(filtered).toEither("No entries matching certificate"),
        );

        const {productID} = NonEmptyList.head(matchingCerts);

        try {
          response = await axiosInstance.get(`/products/${productID}`);
        } catch (e: unknown) {
          const axiosError: AxiosError = <AxiosError>e;
          throwE(`${axiosError.message}, response=${JSON.stringify(axiosError.response?.data)}`);
        }
        const {name} = await liftEither(Interface({name: NonEmptyString}).decode(response?.data));
        return {name};
      });
    },
  };

  return acuity;
}

// const errorCodec = Interface({status_code: Integer, message: NonEmptyString});
