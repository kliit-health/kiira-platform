import {UserCredits} from "../bll/services/service-pricing";
import {MaybeAsync} from "purify-ts";

export type UserId = string

export interface UserLookup {
  credits(id: UserId): MaybeAsync<UserCredits>;
}
