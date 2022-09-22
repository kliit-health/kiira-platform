import {ServiceCost} from "../bll/services/service-pricing";
import {MaybeAsync} from "purify-ts";

export type ServiceId = string

export interface ServiceLookup {
  cost(id: ServiceId): MaybeAsync<ServiceCost>
}
