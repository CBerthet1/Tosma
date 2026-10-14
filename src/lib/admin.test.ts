import assert from "node:assert/strict";
import test from "node:test";
import { hasAdminGroup } from "./admin";

test("grants administrator access to the geek and vpmatos groups", () => {
  assert.equal(hasAdminGroup(["geek"]), true);
  assert.equal(hasAdminGroup(["vpmatos"]), true);
  assert.equal(hasAdminGroup(["user", "vpmatos"]), true);
});

test("does not grant administrator access without an administrator group", () => {
  assert.equal(hasAdminGroup(["user"]), false);
  assert.equal(hasAdminGroup([]), false);
  assert.equal(hasAdminGroup(undefined), false);
});
