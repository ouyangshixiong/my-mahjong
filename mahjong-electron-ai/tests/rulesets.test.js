const test = require("node:test");
const assert = require("node:assert/strict");
const { removeOneTile, scoreHand, sortTiles } = require("../server/mahjong");
const { DEFAULT_RULESET_ID, getRuleset, getRulesets } = require("../server/rulesets");

test("blood-flow is the explicit default ruleset", () => {
  assert.equal(DEFAULT_RULESET_ID, "sichuan-xueliu");
  assert.equal(getRulesets()[0].id, DEFAULT_RULESET_ID);
  const ruleset = getRuleset(DEFAULT_RULESET_ID);
  assert.equal(ruleset.gameplay.allowRepeatWins, true);
  assert.equal(ruleset.gameplay.winnerExitsAfterWin, false);
  assert.equal(ruleset.gameplay.allowPengAfterWin, false);
  assert.equal(ruleset.gameplay.roundEndMode, "wallEmpty");
  assert.equal(ruleset.gameplay.maxWinners, 0);
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
