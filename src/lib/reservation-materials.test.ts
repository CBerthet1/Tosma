import assert from "node:assert/strict";
import test from "node:test";
import { parseReservationMaterials } from "./reservation-materials";

test("accepts empty and valid reservation material lists", () => {
  const materials = [
    { matosId: 3, quantity: 2 },
    { matosId: 7, quantity: 1 },
  ];

  assert.deepEqual(parseReservationMaterials([]), []);
  assert.deepEqual(parseReservationMaterials(materials), materials);
});

test("parses serialized reservation material lists", () => {
  assert.deepEqual(
    parseReservationMaterials('[{"matosId":3,"quantity":2}]'),
    [{ matosId: 3, quantity: 2 }],
  );
});

test("reports malformed serialized data separately from invalid list shapes", () => {
  assert.throws(
    () => parseReservationMaterials("{"),
    /Les matériels d'une réservation ne sont pas un JSON valide\./,
  );
  assert.throws(
    () => parseReservationMaterials({ matosId: 3, quantity: 2 }),
    /Le format des matériels d'une réservation est invalide\./,
  );
});

test("rejects null entries and non-positive or non-integer material values", () => {
  for (const materials of [
    [null],
    [{ matosId: 0, quantity: 1 }],
    [{ matosId: 3, quantity: 0 }],
    [{ matosId: 3, quantity: 1.5 }],
  ]) {
    assert.throws(
      () => parseReservationMaterials(materials),
      /Le format des matériels d'une réservation est invalide\./,
    );
  }
});
