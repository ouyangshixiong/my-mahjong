const test = require("node:test");
const assert = require("node:assert/strict");
const {
  analyzeHand,
  isWinningHand,
  readyAfterDiscards,
  winningTiles,
  scoreHand
} = require("../server/mahjong");
const { getRuleset } = require("../server/rulesets");

const hongzhong = getRuleset("hongzhong");
const xuezhan = getRuleset("sichuan-xuezhan");

test("detects a standard Mahjong winning hand", () => {
  const hand = [
    "m1", "m2", "m3",
    "m4", "m5", "m6",
    "p2", "p3", "p4",
    "s7", "s8", "s9",
    "z5", "z5"
  ];
  assert.equal(isWinningHand(hand, hongzhong), true);
});

test("detects seven pairs", () => {
  const hand = [
    "m1", "m1",
    "m9", "m9",
    "p2", "p2",
    "p8", "p8",
    "s3", "s3",
    "s4", "s4",
    "s7", "s7"
  ];
  assert.equal(isWinningHand(hand, hongzhong), true);
});

test("finds winning tiles for a ready hand", () => {
  const hand = [
    "m1", "m2", "m3",
    "m4", "m5", "m6",
    "p2", "p3", "p4",
    "p7", "p8", "p9",
    "m9"
  ];
  const waits = winningTiles(hand, [], xuezhan);
  assert.deepEqual(waits.map((wait) => wait.tile), ["m9"]);
});

test("lists ready discards for a 14-tile hand", () => {
  const hand = [
    "m1", "m2", "m3",
    "m4", "m5", "m6",
    "p1", "p2", "p3",
    "p4", "p5", "p6",
    "m9", "p9"
  ];
  const options = readyAfterDiscards(hand, [], xuezhan);
  assert.equal(options.length, 2);
  assert.deepEqual(options.map((option) => option.discard).sort(), ["m9", "p9"]);
});

test("analysis requires visibleTiles explicitly", () => {
  assert.throws(
    () => analyzeHand({ hand: ["m1"] }, hongzhong),
    /visibleTiles must be an array/
  );
});

test("sichuan xuezhan requires lacking one suit", () => {
  const threeSuits = [
    "m1", "m2", "m3",
    "p1", "p2", "p3",
    "s1", "s2", "s3",
    "m7", "m8", "m9",
    "p5", "p5"
  ];
  const lackOneSuit = [
    "m1", "m2", "m3",
    "m4", "m5", "m6",
    "p1", "p2", "p3",
    "p7", "p8", "p9",
    "m9", "m9"
  ];
  assert.equal(isWinningHand(threeSuits, xuezhan), false);
  assert.equal(isWinningHand(lackOneSuit, xuezhan), true);
});

test("hongzhong wildcard completes a missing tile", () => {
  const hand = [
    "m1", "m2", "z5",
    "m4", "m5", "m6",
    "p2", "p3", "p4",
    "s7", "s8", "s9",
    "p9", "p9"
  ];
  assert.equal(isWinningHand(hand, hongzhong), true);
  const score = scoreHand(hand, hongzhong);
  assert.equal(score.isWinning, true);
  assert.ok(score.patterns.some((pattern) => pattern.id === "hongZhong"));
});

test("scores pure seven pairs for xuezhan", () => {
  const hand = [
    "m1", "m1",
    "m2", "m2",
    "m3", "m3",
    "m4", "m4",
    "m5", "m5",
    "m6", "m6",
    "m7", "m7"
  ];
  const score = scoreHand(hand, xuezhan);
  assert.equal(score.isWinning, true);
  assert.ok(score.patterns.some((pattern) => pattern.id === "qingQiDui"));
});
