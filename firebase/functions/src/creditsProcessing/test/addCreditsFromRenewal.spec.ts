import {it} from "mocha";
import {assert} from "chai";
import {Balance, addCreditsFromRenewal} from "../util";
import {AppointmentType, AppointmentValues, OperationType} from "../types";
import {Credits, CreditType, UserCredits} from "../../domain/bll/services/service-pricing";
import {NonEmptyList} from "purify-ts";
import {PlanCreditsCodec} from "../../domain/models/Plan";


it("Credit to user on a mental health subscription renewal", () => {
  const variable = NonEmptyList([CreditType.TherapySession, 4]);
  const credits: Credits = addCreditsFromRenewal(
{
  HealthCheck: 0,
  VideoVisit: 0,
  TherapySession: 0,
},
{
  credits: PlanCreditsCodec.decode({[CreditType.TherapySession]: 4}).unsafeCoerce(),
}
  );


  assert.equal(balance.visits, 0);
});
