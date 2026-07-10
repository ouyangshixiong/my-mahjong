const test = require("node:test");
const assert = require("node:assert/strict");
const {
  analyzeHand,
  assertExchangeSelection,
  chooseExchangeTiles,
  chooseLackSuit,
  exchangeHands,
  isWinningHand,
  legalDiscardTiles,
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
  assert.equal(isWinningHand(hand, hongzhong, null), true);
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
  assert.equal(isWinningHand(hand, hongzhong, null), true);
});

test("finds winning tiles for a ready hand", () => {
  const hand = [
    "m1", "m2", "m3",
    "m4", "m5", "m6",
    "p2", "p3", "p4",
    "p7", "p8", "p9",
    "m9"
  ];
  const waits = winningTiles(hand, [], xuezhan, "s");
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
  const options = readyAfterDiscards(hand, [], xuezhan, "s");
  assert.equal(options.length, 2);
  assert.deepEqual(options.map((option) => option.discard).sort(), ["m9", "p9"]);
});

test("analysis requires visibleTiles explicitly", () => {
  assert.throws(
    () => analyzeHand({ hand: ["m1"], lackSuit: null }, hongzhong),
    /visibleTiles must be an array/
  );
});

test("sichuan xuezhan requires clearing the declared lack suit", () => {
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
  assert.equal(isWinningHand(threeSuits, xuezhan, "s"), false);
  assert.equal(isWinningHand(lackOneSuit, xuezhan, "s"), true);
  assert.equal(isWinningHand(lackOneSuit, xuezhan, "m"), false);
});

test("sichuan xuezhan forces declared-suit discards first", () => {
  const hand = [
    "m1", "m2", "m3", "m4",
    "p1", "p2", "p3", "p4", "p5",
    "s1", "s2", "s3", "s4", "s5"
  ];
  assert.deepEqual(legalDiscardTiles(hand, xuezhan, "m"), ["m1", "m2", "m3", "m4"]);
  assert.deepEqual(
    legalDiscardTiles(hand.filter((tile) => !tile.startsWith("m")), xuezhan, "m"),
    ["p1", "p2", "p3", "p4", "p5", "s1", "s2", "s3", "s4", "s5"]
  );
});

test("dingque is a win prerequisite rather than an extra scoring pattern", () => {
  const hand = [
    "m1", "m2", "m3",
    "m4", "m5", "m6",
    "p1", "p2", "p3",
    "p7", "p8", "p9",
    "m9", "m9"
  ];
  const score = scoreHand(hand, xuezhan, "s");
  assert.equal(score.isWinning, true);
  assert.equal(score.cappedFan, 0);
  assert.deepEqual(score.patterns.map((pattern) => pattern.id), ["baseHu"]);
});

test("dingque recommendation chooses the least populated suit", () => {
  const result = chooseLackSuit([
    "m1", "m2",
    "p1", "p2", "p3", "p4", "p5",
    "s1", "s2", "s3", "s4", "s5", "s6"
  ], xuezhan);
  assert.equal(result.lackSuit, "m");
  assert.equal(result.ranked[0].tileCount, 2);
});

test("exchange-three recommendation returns three tiles from one suit", () => {
  const hand = [
    "m1", "m2", "m3", "m4", "m6", "m8",
    "p1", "p2", "p3",
    "s2", "s4", "s6", "s8", "s9"
  ];
  const choice = chooseExchangeTiles(hand, xuezhan);
  assert.equal(choice.tiles.length, 3);
  assert.equal(new Set(choice.tiles.map((tile) => tile[0])).size, 1);
  assert.deepEqual(assertExchangeSelection(hand, choice.tiles, xuezhan), choice.tiles);
});

test("exchange-three moves all four selections in the chosen direction", () => {
  const hands = [
    ["m1", "m2", "m3"],
    ["p1", "p2", "p3"],
    ["s1", "s2", "s3"],
    ["m7", "m8", "m9"]
  ];
  const result = exchangeHands(hands, hands, "clockwise", xuezhan);
  assert.deepEqual(result.hands[0], ["p1", "p2", "p3"]);
  assert.deepEqual(result.hands[1], ["s1", "s2", "s3"]);
  assert.deepEqual(result.hands[2], ["m7", "m8", "m9"]);
  assert.deepEqual(result.hands[3], ["m1", "m2", "m3"]);
});

test("exchange-three supports counterclockwise and opposite directions", () => {
  const hands = [
    ["m1", "m2", "m3"],
    ["p1", "p2", "p3"],
    ["s1", "s2", "s3"],
    ["m7", "m8", "m9"]
  ];
  assert.deepEqual(exchangeHands(hands, hands, "counterclockwise", xuezhan).received[0], ["m7", "m8", "m9"]);
  assert.deepEqual(exchangeHands(hands, hands, "across", xuezhan).received[0], ["s1", "s2", "s3"]);
});

test("exchange-three rejects mixed-suit selections", () => {
  assert.throws(
    () => assertExchangeSelection(
      ["m1", "m2", "p1", "p2", "s1", "s2"],
      ["m1", "p1", "s1"],
      xuezhan
    ),
    /one suit/
  );
});

test("hongzhong wildcard completes a missing tile", () => {
  const hand = [
    "m1", "m2", "z5",
    "m4", "m5", "m6",
    "p2", "p3", "p4",
    "s7", "s8", "s9",
    "p9", "p9"
  ];
  assert.equal(isWinningHand(hand, hongzhong, null), true);
  const score = scoreHand(hand, hongzhong, null);
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
  const score = scoreHand(hand, xuezhan, "s");
  assert.equal(score.isWinning, true);
  assert.ok(score.patterns.some((pattern) => pattern.id === "qingYiSe"));
  assert.ok(score.patterns.some((pattern) => pattern.id === "qiDui"));
  assert.equal(score.cappedFan, 3);
});

test("sichuan analysis rejects a missing dingque declaration", () => {
  assert.throws(
    () => analyzeHand({ hand: ["m1"], visibleTiles: [] }, xuezhan),
    /lackSuit is required/
  );
});
