const test = require("node:test");
const assert = require("node:assert/strict");
const { recommendDiscard } = require("../server/ai");

test("recommends hu when the hand is already complete", () => {
  const result = recommendDiscard({
    hand: [
      "m1", "m2", "m3",
      "m4", "m5", "m6",
      "p2", "p3", "p4",
      "s7", "s8", "s9",
      "z5", "z5"
    ],
    visibleTiles: [],
    rulesetId: "hongzhong"
  });
  assert.equal(result.action, "hu");
  assert.equal(result.discard, null);
});

test("ranks legal discards for an incomplete 14-tile hand", () => {
  const result = recommendDiscard({
    hand: [
      "m1", "m2", "m3",
      "m4", "m5", "m6",
      "p2", "p3", "p4",
      "s7", "s8",
      "p9", "p9",
      "m9"
    ],
    visibleTiles: [],
    rulesetId: "hongzhong"
  });

  assert.equal(result.action, "discard");
  assert.ok(result.analysis.hand.includes(result.discard));
  assert.ok(result.ranked.length > 0);
  assert.equal(result.ranked[0].discard, result.discard);
});
