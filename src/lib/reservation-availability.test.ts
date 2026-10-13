import assert from "node:assert/strict";
import test from "node:test";
import { getPeakReservedQuantities } from "./reservation-availability";

const at = (hour: number) => new Date(2026, 0, 1, 0, hour * 60);

test("does not add reservations that occupy successive, non-overlapping slots", () => {
  const peak = getPeakReservedQuantities(
    [
      { start: at(9), end: at(10), matos: [{ matosId: 1, quantity: 4 }] },
      { start: at(10), end: at(11), matos: [{ matosId: 1, quantity: 4 }] },
    ],
    at(9),
    at(11),
  );

  assert.equal(peak.get(1), 4);
});

test("adds quantities during partial overlaps", () => {
  const peak = getPeakReservedQuantities(
    [
      { start: at(9), end: at(10), matos: [{ matosId: 1, quantity: 3 }] },
      { start: at(9.5), end: at(11), matos: [{ matosId: 1, quantity: 2 }] },
    ],
    at(9),
    at(11),
  );

  assert.equal(peak.get(1), 5);
});

test("treats a reservation ending at the next start as non-overlapping", () => {
  const peak = getPeakReservedQuantities(
    [
      { start: at(9), end: at(10), matos: [{ matosId: 1, quantity: 3 }] },
      { start: at(10), end: at(11), matos: [{ matosId: 1, quantity: 2 }] },
    ],
    at(9),
    at(11),
  );

  assert.equal(peak.get(1), 3);
});

test("clips reservations to the requested interval and tracks materials independently", () => {
  const peak = getPeakReservedQuantities(
    [
      {
        start: at(8),
        end: at(10),
        matos: [
          { matosId: 1, quantity: 3 },
          { matosId: 2, quantity: 2 },
        ],
      },
      { start: at(9), end: at(12), matos: [{ matosId: 1, quantity: 2 }] },
    ],
    at(9),
    at(11),
  );

  assert.equal(peak.get(1), 5);
  assert.equal(peak.get(2), 2);
});

test("returns no reserved quantity for an empty interval", () => {
  const peak = getPeakReservedQuantities(
    [{ start: at(9), end: at(10), matos: [{ matosId: 1, quantity: 4 }] }],
    at(10),
    at(11),
  );

  assert.equal(peak.has(1), false);
});

test("excludes the reservation being edited from the availability calculation", () => {
  const peak = getPeakReservedQuantities(
    [
      {
        id: 10,
        start: at(9),
        end: at(11),
        matos: [{ matosId: 1, quantity: 4 }],
      },
      {
        id: 11,
        start: at(10),
        end: at(11),
        matos: [{ matosId: 1, quantity: 2 }],
      },
    ],
    at(9),
    at(11),
    10,
  );

  assert.equal(peak.get(1), 2);
});
