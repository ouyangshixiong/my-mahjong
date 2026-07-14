const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { decidePostWinDraw } = require("../game/post-win-turn");

const renderer = fs.readFileSync(path.join(__dirname, "../client/renderer.js"), "utf8");

function functionSource(name, nextName) {
  const start = renderer.indexOf(`function ${name}`);
  const end = renderer.indexOf(`function ${nextName}`, start);
  assert.notEqual(start, -1, `${name} must exist`);
  assert.notEqual(end, -1, `${nextName} must follow ${name}`);
  return renderer.slice(start, end);
}

test("a non-winning draw after hu must be discarded without changing the locked hand", () => {
  const lockedHand = ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "p2", "p2", "p3", "p4"];
  const handAfterDraw = [...lockedHand, "s6"];

  const decision = decidePostWinDraw(handAfterDraw, "s6", false);

  assert.deepEqual(decision, { action: "discard", discard: "s6" });
  assert.deepEqual(handAfterDraw.filter((tile, index) => index !== handAfterDraw.lastIndexOf(decision.discard)), lockedHand);
});

test("a winning draw after hu is kept as the next winning tile", () => {
  assert.deepEqual(
    decidePostWinDraw(["m1", "m1", "m2", "m3"], "m1", true),
    { action: "hu", discard: null }
  );
});

test("post-win turns reject a missing drawn tile instead of selecting another hand tile", () => {
  assert.throws(
    () => decidePostWinDraw(["m1", "m2", "m3"], "m4", false),
    /missing from hand/
  );
});

test("hand locking depends only on whether the player has won, not on the ruleset", () => {
  const lockedDecisionChecks = renderer.match(/const decision = state\.winCounts\[playerIndex\] > 0/g) || [];

  assert.equal(lockedDecisionChecks.length, 2);
  assert.doesNotMatch(renderer, /state\.winCounts\[playerIndex\] > 0 && ruleset\.gameplay\.allowRepeatWins/);
});

test("bot draw flow checks hu before considering a gang", () => {
  const advanceSource = functionSource("advanceFrom", "nextActivePlayer");
  const afterGangSource = functionSource("continueAfterGang", "continuePostWinSelfTurn");

  assert.ok(advanceSource.indexOf("if (isWinning)") < advanceSource.indexOf("waitPreservingBotSelfGangOptions"));
  assert.ok(afterGangSource.indexOf("if (isWinning)") < afterGangSource.indexOf("waitPreservingBotSelfGangOptions"));
});

test("bot gang claims must preserve existing waits", () => {
  const meldOptionsSource = functionSource("discardMeldOptions", "resolveDiscardActions");
  const meldClaimSource = functionSource("resolveMeldClaims", "executePeng");

  assert.match(renderer, /window\.mahjongAI\.waitPreservingSelfGangOptions/);
  assert.match(meldOptionsSource, /canBotClaimDiscardGang/);
  assert.match(meldClaimSource, /discardMeldOptions/);
});
