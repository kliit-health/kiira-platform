import {describe, it} from "mocha";
import {assert} from "chai";
import {CreditType, ServiceCost, servicePricing, UserCredits} from "../service-pricing";

describe("serviceCost", () => {
  const zeroCreditBalance = creditBalance();
  const freeService = serviceCost(0);

  it("should be free for when cost is 0 and balance is 0", () => {
    const pricing = servicePricing(
      zeroCreditBalance,
      freeService
    );
    assert.equal(pricing.dollars, 0);
  });

  it("should be 0 when credits are equal to cost", () => {
    const pricing = servicePricing(
      creditBalance(1),
      serviceCost(1)
    );
    assert.equal(pricing.dollars, 0);
  });

  it("should be 0 when credits exceed cost", () => {
    const pricing = servicePricing(
      creditBalance(2),
      serviceCost(1)
    );
    assert.equal(pricing.dollars, 0);
  });

  it("should be credits * credit dollar value (2 * 60) when balance is zero", () => {
    const pricing = servicePricing(
      zeroCreditBalance,
      serviceCost(2)
    );
    assert.equal(pricing.dollars, 120);
  });

  it("when mental health credits are 1 and service is mental health, cost is 0", () => {
    const pricing = servicePricing(
      creditBalance(0, 1),
      serviceCost(2, CreditType.MentalHealth)
    );
    assert.equal(pricing.dollars, 0);
  });
});

function creditBalance(visitCredits?: number, mentalHealth?: number): UserCredits {
  return {
    visits: visitCredits ?? 0,
    credits: {
      [CreditType.MentalHealth]: mentalHealth ?? 0,
    },
  };
}

function serviceCost(costInVisitCredits: number, type?: CreditType): ServiceCost {
  return {costInVisitCredits, type: type ?? CreditType.HealthCheck};
}
