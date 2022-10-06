import {it} from "mocha";
import {assert} from "chai";
import {Balance, processBalancesForAppointments} from "../util";
import {OperationType} from "../types";

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
