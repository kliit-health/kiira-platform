export type PricingInfo = {
  readonly dollars: number;
}
export type UserCredits = {
  readonly visits: number,
  readonly credits?: Credits,
  readonly orgCredits?: OrganizationCredits
}

export type OrganizationCredits = {
  readonly visits: number
}

export enum CreditType {
  HealthCheck = "HealthCheck",
  VideoVisit = "VideoVisit",
  TherapySession = "TherapySession",
}

type Credits = {
  [key in CreditType]?: number;
};


export type ServiceCost = {
  readonly type: CreditType,
  readonly costInVisitCredits: number,
}

const dollarsPerVisit = 60;

function hasCreditForRequiredServiceCreditType(userCredits: UserCredits, creditType: CreditType) {
  if (creditType == null) return false;
  if (userCredits.credits == null) return false;

  const credits = userCredits.credits[creditType];
  if (credits == null) return false;
  return credits > 0;
}

function noCharge(): { dollars: number } {
  return {dollars: 0};
}

export function servicePricing(
  userCredits: UserCredits,
  serviceCost: ServiceCost,
): PricingInfo {
  const organizationCredits: number = userCredits?.orgCredits?.visits ?? 0;
  if (organizationCredits >= serviceCost.costInVisitCredits) {
    return noCharge();
  }

  if (hasCreditForRequiredServiceCreditType(userCredits, serviceCost.type)) {
    return noCharge();
  }

  const creditsOwed = serviceCost.costInVisitCredits - userCredits.visits;
  let cost = 0;
  if (creditsOwed > 0) {
    cost = creditsOwed * dollarsPerVisit;
  }
  return {dollars: cost};
}
