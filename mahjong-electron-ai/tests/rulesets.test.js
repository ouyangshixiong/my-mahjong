const test = require("node:test");
const assert = require("node:assert/strict");
const { removeOneTile, scoreHand, sortTiles } = require("../server/mahjong");
const {
  DEFAULT_RULESET_ID,
  assertRulesetShape,
  getRuleset,
  getRulesets
} = require("../server/rulesets");

test("blood-flow is the explicit default ruleset", () => {
  assert.equal(DEFAULT_RULESET_ID, "sichuan-xueliu");
  assert.equal(getRulesets()[0].id, DEFAULT_RULESET_ID);
  const ruleset = getRuleset(DEFAULT_RULESET_ID);
  assert.equal(ruleset.gameplay.allowRepeatWins, true);
  assert.equal(ruleset.gameplay.winnerExitsAfterWin, false);
  assert.equal(ruleset.gameplay.allowPengAfterWin, false);
  assert.equal(ruleset.gameplay.roundEndMode, "wallEmpty");
  assert.equal(ruleset.gameplay.maxWinners, 0);
  assert.equal(ruleset.gameplay.drawSettlementPlayerScope, "nonWinners");
  assert.equal(ruleset.scoring.basePoints, 100);
});

test("draw settlement participant scope is defined by every server ruleset", () => {
  for (const ruleset of getRulesets()) {
    assert.ok(["none", "activePlayers", "nonWinners"].includes(ruleset.gameplay.drawSettlementPlayerScope));
  }
  assert.equal(getRuleset("hongzhong").gameplay.drawSettlementPlayerScope, "none");
});

test("server rejects draw settlement switches that conflict with their participant scope", () => {
  const enabledWithoutPlayers = getRuleset("sichuan-xueliu");
  enabledWithoutPlayers.gameplay.drawSettlementPlayerScope = "none";
  assert.throws(
    () => assertRulesetShape(enabledWithoutPlayers),
    /draw settlement switches conflict/
  );

  const disabledWithPlayers = getRuleset("hongzhong");
  disabledWithPlayers.gameplay.drawSettlementPlayerScope = "nonWinners";
  assert.throws(
    () => assertRulesetShape(disabledWithPlayers),
    /draw settlement switches conflict/
  );
});

test("every ruleset uses a 100-point scoring base", () => {
  for (const ruleset of getRulesets()) {
    assert.equal(ruleset.scoring.basePoints, 100);
  }
});

test("blood-flow permits the same ready hand to self-draw repeatedly", () => {
  const ruleset = getRuleset("sichuan-xueliu");
  const readyHand = sortTiles([
    "m1", "m2", "m3",
    "m4", "m5", "m6",
    "m7", "m8", "m9",
    "p1", "p2", "p3",
    "p9"
  ]);
  const wall = ["p9", "p9"];
  const wonTiles = [];
  let hand = readyHand;
  let winCount = 0;

  while (wall.length > 0) {
    const winningTile = wall.pop();
    const winningHand = sortTiles([...hand, winningTile]);
    assert.equal(scoreHand(winningHand, ruleset, "s").isWinning, true);
    wonTiles.push(winningTile);
    winCount += 1;
    hand = removeOneTile(winningHand, winningTile, ruleset);
  }

  assert.equal(winCount, 2);
  assert.deepEqual(wonTiles, ["p9", "p9"]);
  assert.deepEqual(hand, readyHand);
  assert.equal(wall.length, 0);
});
