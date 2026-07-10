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
    lackSuit: null,
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
    lackSuit: null,
    rulesetId: "hongzhong"
  });

  assert.equal(result.action, "discard");
  assert.ok(result.analysis.hand.includes(result.discard));
  assert.ok(result.ranked.length > 0);
  assert.equal(result.ranked[0].discard, result.discard);
});

test("sichuan recommendation only ranks declared-suit tiles until dingque is cleared", () => {
  const result = recommendDiscard({
    hand: [
      "m1", "m2", "m3", "m4", "m6", "m8", "m8",
      "p4", "p5", "p5", "p8",
      "s6", "s7", "s8"
    ],
    visibleTiles: [],
    lackSuit: "m",
    rulesetId: "sichuan-xuezhan"
  });

  assert.equal(result.action, "discard");
  assert.equal(result.discard.startsWith("m"), true);
  assert.equal(result.ranked.every((item) => item.discard.startsWith("m")), true);
  assert.match(result.reason, /定缺万/);
});
