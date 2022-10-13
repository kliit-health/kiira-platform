import {describe, it} from "mocha";
import {assert} from "chai";
import {Credits, CreditType, ServiceCost, servicePricing, UserCredits, getNewCreditInstance} from "../service-pricing";

describe("serviceCost", () => {
  const zeroCreditBalance = creditBalance({});
  const freeService = serviceCost({costInVisitCredits: 0});

  it("should be free for when cost is 0 and balance is 0", () => {
    const pricing = servicePricing(
      zeroCreditBalance,
      freeService,
    );
    assert.equal(pricing.dollars, 0);
  });

  it("should be 0 when credits are equal to cost", () => {
    const pricing = servicePricing(
      creditBalance({visitCredits: 1}),
      serviceCost({costInVisitCredits: 1}),
    );
    assert.equal(pricing.dollars, 0);
  });

  it("should be 0 when credits exceed cost", () => {
    const pricing = servicePricing(
      creditBalance({visitCredits: 2}),
      serviceCost({costInVisitCredits: 1}),
    );
    assert.equal(pricing.dollars, 0);
  });

  it("should be 0 when user has unlimited appointments.", () => {
    const userCredits: UserCredits = {
      visits: 0,
      credits: getNewCreditInstance(),
      orgCredits: {visits: Infinity},
    };
    const pricing = servicePricing(
      userCredits,
      serviceCost({costInVisitCredits: 1}),
    );
    assert.equal(pricing.dollars, 0);
  });

  it("should be credits * credit dollar value (2 * 60) when balance is zero", () => {
    const pricing = servicePricing(
      zeroCreditBalance,
      serviceCost({costInVisitCredits: 2}),
    );
    assert.equal(pricing.dollars, 120);
  });

  it("when mental health credits are 1 and service is mental health, cost is 0", () => {
    const pricing = servicePricing(
      creditBalance({therapySession: 1}),
      serviceCost({costInVisitCredits: 2, type: CreditType.TherapySession}),
    );
    assert.equal(pricing.dollars, 0);
  });
});

interface CreditBalanceParams {
  visitCredits?: number;
  therapySession?: number;
}

function creditBalance(params: CreditBalanceParams): UserCredits {
  const visits: number = params.visitCredits ?? 0;
  const credits : Credits = getNewCreditInstance();
  credits[CreditType.TherapySession] = params.therapySession ?? 0;
  return {visits, credits};
}

interface ServiceCostParams {
  costInVisitCredits: number;
  type?: CreditType;
}

function serviceCost(params: ServiceCostParams): ServiceCost {
  return {
    costInVisitCredits: params.costInVisitCredits,
    type: params.type ?? CreditType.HealthCheck,
  };
}

