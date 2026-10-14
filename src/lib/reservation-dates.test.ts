import assert from "node:assert/strict";
import test from "node:test";
import { getDateAfterMonths } from "./reservation-dates";

test("clamps a month-end date to the last day of a shorter month", () => {
  const result = getDateAfterMonths(new Date(2023, 0, 31, 17, 45), 1);

  assert.equal(result.getFullYear(), 2023);
  assert.equal(result.getMonth(), 1);
  assert.equal(result.getDate(), 28);
  assert.equal(result.getHours(), 17);
  assert.equal(result.getMinutes(), 45);
});

test("preserves leap day when the target February has 29 days", () => {
  const result = getDateAfterMonths(new Date(2024, 0, 31), 1);

  assert.equal(result.getFullYear(), 2024);
  assert.equal(result.getMonth(), 1);
  assert.equal(result.getDate(), 29);
});

test("rolls over years while respecting leap-year month lengths", () => {
  const result = getDateAfterMonths(new Date(2023, 10, 30, 9), 3);

  assert.equal(result.getFullYear(), 2024);
  assert.equal(result.getMonth(), 1);
  assert.equal(result.getDate(), 29);
  assert.equal(result.getHours(), 9);
});
