export type PricingInfo = {
  readonly dollars: number;
}
export type UserCredits = {
  readonly visits: number,
  readonly credits?: Credits
}

export enum CreditType {
  HealthCheck = "HealthCheck",
  VideoVisit = "VideoVisit",
  TherapySession = "TherapySession",
  MentalHealth = "MentalHealth"
}

type Credits = {
  [key in CreditType]?: number;
};


export type ServiceCost = {
  readonly type: CreditType,
  readonly costInVisitCredits: number,
}

const dollarsPerVisit = 60;

function hasServiceTypeCredits(userCredits: UserCredits, creditType: CreditType) {
  if (creditType == null) return false;
  if (userCredits.credits == null) return false;

  const credits = userCredits.credits[creditType];
  if (credits == null) return false;
  return credits > 0;
}

export function servicePricing(
  userCredits: UserCredits,
  serviceCost: ServiceCost
): PricingInfo {
  const type = serviceCost.type;
  if (hasServiceTypeCredits(userCredits, type)) {
    return {dollars: 0};
  }

  const creditsOwed = serviceCost.costInVisitCredits - userCredits.visits;
  let cost = 0;
  if (creditsOwed > 0) {
    cost = creditsOwed * dollarsPerVisit;
  }
  return {dollars: cost};
}
