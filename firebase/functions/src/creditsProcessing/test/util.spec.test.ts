import {it} from "mocha";
import {assert} from "chai";
import {Balance, calculateRemainingBalances, processBalancesForAppointments} from "../util";
import {AppointmentType, AppointmentValues, CreditType, OperationType, UserBalance} from "../types";

it("Credit op increments credit by 1", () => {
  const balance: Balance = processBalancesForAppointments(
    {credits: 0, visits: 0},
    0,
    OperationType.Credit,
  );
  assert.equal(balance.credits, 1);
});

it("Credit op does not increment visits", () => {
  const balance: Balance = processBalancesForAppointments(
    {credits: 0, visits: 0},
    0,
    OperationType.Credit,
  );
  assert.equal(balance.visits, 0);
});
it("Debit decrements visits by visit cost", () => {
  const balance: Balance = processBalancesForAppointments(
    {credits: 0, visits: 5},
    5,
    OperationType.Debit,
  );
  assert.equal(balance.visits, 0);
});
it("Debit does not decrement credits when there are enough visits", () => {
  const balance: Balance = processBalancesForAppointments(
    {credits: 1, visits: 5},
    5,
    OperationType.Debit,
  );
  assert.equal(balance.credits, 1);
});

it("Debit decrements credit by 1 when there are not enough visits", () => {
  const balance: Balance = processBalancesForAppointments(
    {credits: 1, visits: 0},
    5,
    OperationType.Debit,
  );
  assert.equal(balance.credits, 0);
});

it("Debits to zero balances results in zero credits", () => {
  const balance: Balance = processBalancesForAppointments(
    {credits: 0, visits: 0},
    5,
    OperationType.Debit,
  );
  assert.equal(balance.credits, 0);
});
it("Debits to zero balances results in zero visits", () => {
  const balance: Balance = processBalancesForAppointments(
    {credits: 0, visits: 0},
    5,
    OperationType.Debit,
  );
  assert.equal(balance.visits, 0);
});
it("Debits result in no change to visits when visit cost is 0", () => {
  const balance: Balance = processBalancesForAppointments(
    {credits: 0, visits: 1},
    0,
    OperationType.Debit,
  );
  assert.equal(balance.visits, 1);
});


it("", () => {
  const appointmentVal: AppointmentValues = {type: AppointmentType.VideoVisit, visitCost: 3};
  const initialBalance: UserBalance = {
    visits: 1,
    credits: {[CreditType.VideoVisit]: 1, [CreditType.TherapySession]: 1, [CreditType.HealthCheck]: 0},
  };
  const first: UserBalance = calculateRemainingBalances(
    appointmentVal,
    initialBalance,
    OperationType.Debit,
  );

  assert.equal(first.visits, 1);
  assert.equal(first.credits.TherapySession, 1);
  assert.equal(first.credits.VideoVisit, 0);

  const second: UserBalance = calculateRemainingBalances(
    {type: AppointmentType.TherapySession, visitCost: 3},
    first,
    OperationType.Debit,
  );

  assert.equal(second.visits, 1);
  assert.equal(second.credits.TherapySession, 0);
  assert.equal(second.credits.VideoVisit, 0);

  const third: UserBalance = calculateRemainingBalances(
    {type: AppointmentType.VideoVisit, visitCost: 1},
    second,
    OperationType.Debit,
  );

  assert.equal(third.visits, 0);
  assert.equal(third.credits.TherapySession, 0);
  assert.equal(third.credits.VideoVisit, 0);
});
