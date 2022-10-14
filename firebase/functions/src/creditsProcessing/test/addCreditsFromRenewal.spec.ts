import {it} from "mocha";
import {assert} from "chai";
import {addCreditsFromRenewal} from "../util";
import {CreditType, getNewCreditInstance, UserCredits} from "../../domain/bll/services/service-pricing";
import {NonEmptyList} from "purify-ts";

function makeCredits(tuple: [CreditType, number]): NonEmptyList<[CreditType, number]> {
  return NonEmptyList.fromArray<[CreditType, number]>([tuple]).unsafeCoerce();
}

describe("For a user renewing for the first time", () => {
  describe("Given the user has no credits", () => {
    it(
      "then they are given all credits specified by subscription",
      () => {
        const userCredits: UserCredits = addCreditsFromRenewal(
          {
            credits: getNewCreditInstance(),
            visits: 0,
          },
          {
            credits: makeCredits([CreditType.TherapySession, 2]),
          },
        );

        assert.equal(userCredits.credits.TherapySession, 2);
      },
    );

    it(
      "then membershipCredits flag will be false",
      () => {
        const userCredits: UserCredits = addCreditsFromRenewal(
          {
            credits: getNewCreditInstance(),
            visits: 0,
          },
          {
            credits: makeCredits([CreditType.TherapySession, 2]),
          },
        );

        assert.equal(userCredits.hasMembershipPlanCredits, false);
      },
    );
  });
  describe("Given the user has some credits", () => {
    it(
      "then credits total is set to sum",
      () => {
        const newCreditInstance = getNewCreditInstance();
        newCreditInstance.TherapySession = 1;

        const userCredits: UserCredits = addCreditsFromRenewal(
          {
            credits: newCreditInstance,
            visits: 0,
          },
          {
            credits: makeCredits([CreditType.TherapySession, 2]),
          },
        );

        assert.equal(userCredits.credits.TherapySession, 3);
      },
    );

    it(
      "then membershipCredits flag will be true",
      () => {
        const newCreditInstance = getNewCreditInstance();
        newCreditInstance.TherapySession = 1;

        const userCredits: UserCredits = addCreditsFromRenewal(
          {
            credits: newCreditInstance,
            visits: 0,
          },
          {
            credits: makeCredits([CreditType.TherapySession, 2]),
          },
        );

        assert.equal(userCredits.hasMembershipPlanCredits, true);
      },
    );
  });
  describe("Given the user has excess credits", () => {
    it(
      "then credits are unchanged",
      () => {
        const newCreditInstance = getNewCreditInstance();
        newCreditInstance.TherapySession = 5;

        const userCredits: UserCredits = addCreditsFromRenewal(
          {
            credits: newCreditInstance,
            visits: 0,
          },
          {
            credits: makeCredits([CreditType.TherapySession, 2]),
          },
        );

        assert.equal(userCredits.credits.TherapySession, 5);
      },
    );
    it(
      "then hasMembershipPlanCredits will be true",
      () => {
        const newCreditInstance = getNewCreditInstance();
        newCreditInstance.TherapySession = 5;

        const userCredits: UserCredits = addCreditsFromRenewal(
          {
            credits: newCreditInstance,
            visits: 0,
          },
          {
            credits: makeCredits([CreditType.TherapySession, 2]),
          },
        );

        assert.equal(userCredits.hasMembershipPlanCredits, true);
      },
    );
  });
});
describe("For a user that has renewed before", () => {
  describe("Given the user has no credits", () => {
    it(
      "then they are given all credits specified by subscription",
      () => {
        const userCredits: UserCredits = addCreditsFromRenewal(
          {
            hasMembershipPlanCredits: true,
            credits: getNewCreditInstance(),
            visits: 0,
          },
          {
            credits: makeCredits([CreditType.TherapySession, 2]),
          },
        );

        assert.equal(userCredits.credits.TherapySession, 2);
      },
    );

    it(
      "then membershipCredits flag will be false",
      () => {
        const userCredits: UserCredits = addCreditsFromRenewal(
          {
            hasMembershipPlanCredits: true,
            credits: getNewCreditInstance(),
            visits: 0,
          },
          {
            credits: makeCredits([CreditType.TherapySession, 2]),
          },
        );

        assert.equal(userCredits.hasMembershipPlanCredits, false);
      },
    );
  });
  describe("Given the user has some credits", () => {
    it(
      "then credits total is set to sum",
      () => {
        const newCreditInstance = getNewCreditInstance();
        newCreditInstance.TherapySession = 1;

        const userCredits: UserCredits = addCreditsFromRenewal(
          {
            hasMembershipPlanCredits: true,
            credits: newCreditInstance,
            visits: 0,
          },
          {
            credits: makeCredits([CreditType.TherapySession, 2]),
          },
        );

        assert.equal(userCredits.credits.TherapySession, 3);
      },
    );

    it(
      "then membershipCredits flag will be true",
      () => {
        const newCreditInstance = getNewCreditInstance();
        newCreditInstance.TherapySession = 1;

        const userCredits: UserCredits = addCreditsFromRenewal(
          {
            hasMembershipPlanCredits: true,
            credits: newCreditInstance,
            visits: 0,
          },
          {
            credits: makeCredits([CreditType.TherapySession, 2]),
          },
        );

        assert.equal(userCredits.hasMembershipPlanCredits, true);
      },
    );
  });
  describe("Given the user has excess credits", () => {
    it(
      "then credits are unchanged",
      () => {
        const newCreditInstance = getNewCreditInstance();
        newCreditInstance.TherapySession = 5;

        const userCredits: UserCredits = addCreditsFromRenewal(
          {
            hasMembershipPlanCredits: true,
            credits: newCreditInstance,
            visits: 0,
          },
          {
            credits: makeCredits([CreditType.TherapySession, 2]),
          },
        );

        assert.equal(userCredits.credits.TherapySession, 5);
      },
    );
    it(
      "then hasMembershipPlanCredits will be true",
      () => {
        const newCreditInstance = getNewCreditInstance();
        newCreditInstance.TherapySession = 5;

        const userCredits: UserCredits = addCreditsFromRenewal(
          {
            hasMembershipPlanCredits: true,
            credits: newCreditInstance,
            visits: 0,
          },
          {
            credits: makeCredits([CreditType.TherapySession, 2]),
          },
        );

        assert.equal(userCredits.hasMembershipPlanCredits, true);
      },
    );
  });
});


