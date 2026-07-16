const test = require("node:test");
const assert = require("node:assert/strict");
const {
  analyzeHand,
  assertExchangeSelection,
  chooseExchangeTiles,
  chooseLackSuit,
  discardGangPreservesWaits,
  exchangeHands,
  isWinningHand,
  legalDiscardTiles,
  readyAfterDiscards,
  winningTiles,
  waitPreservingSelfGangOptions,
  scoreHand
} = require("../game/mahjong");
const { getRuleset } = require("../game/rulesets");

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

test("screenshot hand refuses the eight-character concealed gang that loses the seven-character wait", () => {
  const handAfterDraw = [
    "m2", "m3", "m4", "m5", "m6", "m6", "m7",
    "m8", "m8", "m8", "m8"
  ];
  const option = { type: "concealed", tile: "m8", meldIndex: null };

  assert.equal(isWinningHand(handAfterDraw, xuezhan, "s"), false);
  assert.deepEqual(
    waitPreservingSelfGangOptions(handAfterDraw, "m8", [option], xuezhan, "s"),
    []
  );
});

test("a player who already won on six characters cannot gang four seven characters when it breaks that winning shape", () => {
  const handAfterDraw = [
    "m1", "m2", "m3", "m4", "m5", "m5", "m6",
    "m7", "m7", "m7", "m7"
  ];
  const option = { type: "concealed", tile: "m7", meldIndex: null };
  const lockedHand = handAfterDraw.slice(0, -1);

  assert.equal(isWinningHand([...lockedHand, "m6"], xuezhan, "s"), true);
  assert.deepEqual(
    waitPreservingSelfGangOptions(handAfterDraw, "m7", [option], xuezhan, "s"),
    []
  );
});

test("AI may concealed-gang when every existing wait is preserved", () => {
  const handAfterDraw = [
    "m1", "m1", "m1", "m1",
    "m2", "m3", "m4",
    "m5", "m6", "m7",
    "p2", "p3", "p4",
    "p9"
  ];
  const option = { type: "concealed", tile: "m1", meldIndex: null };

  assert.deepEqual(
    waitPreservingSelfGangOptions(handAfterDraw, "m1", [option], xuezhan, "s"),
    [option]
  );
});

test("AI refuses a discard gang that destroys the screenshot hand waits", () => {
  const readyHand = [
    "m2", "m3", "m4", "m5", "m6", "m6", "m7",
    "m8", "m8", "m8"
  ];

  assert.equal(discardGangPreservesWaits(readyHand, "m8", xuezhan, "s"), false);
});

test("AI may claim a discard gang when the current wait is preserved", () => {
  const readyHand = [
    "m1", "m1", "m1",
    "m2", "m3", "m4",
    "m5", "m6", "m7",
    "p2", "p3", "p4",
    "p9"
  ];

  assert.equal(discardGangPreservesWaits(readyHand, "m1", xuezhan, "s"), true);
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
  const choice = chooseExchangeTiles(hand, xuezhan, "p");
  assert.equal(choice.tiles.length, 3);
  assert.equal(new Set(choice.tiles.map((tile) => tile[0])).size, 1);
  assert.deepEqual(assertExchangeSelection(hand, choice.tiles, xuezhan, "p"), choice.tiles);
});

test("exchange-three moves all four selections in the chosen direction", () => {
  const hands = [
    ["m1", "m2", "m3"],
    ["p1", "p2", "p3"],
    ["s1", "s2", "s3"],
    ["m7", "m8", "m9"]
  ];
  const result = exchangeHands(hands, hands, "clockwise", xuezhan, ["m", "p", "s", "m"]);
  assert.deepEqual(result.hands[0], ["m7", "m8", "m9"]);
  assert.deepEqual(result.hands[1], ["m1", "m2", "m3"]);
  assert.deepEqual(result.hands[2], ["p1", "p2", "p3"]);
  assert.deepEqual(result.hands[3], ["s1", "s2", "s3"]);
});

test("exchange-three supports counterclockwise and opposite directions", () => {
  const hands = [
    ["m1", "m2", "m3"],
    ["p1", "p2", "p3"],
    ["s1", "s2", "s3"],
    ["m7", "m8", "m9"]
  ];
  const lackSuits = ["m", "p", "s", "m"];
  assert.deepEqual(exchangeHands(hands, hands, "counterclockwise", xuezhan, lackSuits).received[0], ["p1", "p2", "p3"]);
  assert.deepEqual(exchangeHands(hands, hands, "across", xuezhan, lackSuits).received[0], ["s1", "s2", "s3"]);
});

test("exchange-three maps every sender to the correct receiver for all three directions", () => {
  const selections = [
    ["m1", "m2", "m3"],
    ["p1", "p2", "p3"],
    ["s1", "s2", "s3"],
    ["m7", "m8", "m9"]
  ];
  const lackSuits = ["m", "p", "s", "m"];
  const expectedReceived = {
    clockwise: [selections[3], selections[0], selections[1], selections[2]],
    counterclockwise: [selections[1], selections[2], selections[3], selections[0]],
    across: [selections[2], selections[3], selections[0], selections[1]]
  };

  for (const [direction, received] of Object.entries(expectedReceived)) {
    const result = exchangeHands(selections, selections, direction, xuezhan, lackSuits);
    assert.deepEqual(result.received, received, direction);
  }
});

test("exchange-three rejects mixed-suit selections", () => {
  assert.throws(
    () => assertExchangeSelection(
      ["m1", "m2", "p1", "p2", "s1", "s2"],
      ["m1", "p1", "s1"],
      xuezhan,
      "s"
    ),
    /declared shortage suit/
  );
});

test("exchange-three allows other suits to fill a suit with fewer than three tiles", () => {
  const hand = [
    "m4", "m5", "m5", "m6",
    "p1", "p1", "p1", "p2", "p3", "p5", "p6", "p7",
    "s5", "s8"
  ];
  assert.deepEqual(
    assertExchangeSelection(hand, ["m4", "s5", "s8"], xuezhan, "s"),
    ["m4", "s5", "s8"]
  );
});

test("exchange-three requires selecting every tile from the shortage suit before filling", () => {
  const hand = [
    "m4", "m5", "m5", "m6",
    "p1", "p1", "p1", "p2", "p3", "p5", "p6", "p7",
    "s5", "s8"
  ];
  assert.throws(
    () => assertExchangeSelection(hand, ["m4", "p1", "s5"], xuezhan, "s"),
    /every tile/
  );
});

test("exchange-three recommendation fills the screenshot shortage hand", () => {
  const hand = [
    "m4", "m5", "m5", "m6",
    "p1", "p1", "p1", "p2", "p3", "p5", "p6", "p7",
    "s5", "s8"
  ];
  const choice = chooseExchangeTiles(hand, xuezhan, "s");
  assert.equal(choice.suit, "s");
  assert.equal(choice.tiles.length, 3);
  assert.ok(choice.tiles.includes("s5"));
  assert.ok(choice.tiles.includes("s8"));
  assert.equal(choice.usesMixedFill, true);
  assert.deepEqual(assertExchangeSelection(hand, choice.tiles, xuezhan, "s"), choice.tiles);
});

test("exchange-three allows any three fillers when the declared lack suit is absent", () => {
  const hand = [
    "m1", "m2", "m3", "m4", "m5", "m6", "m7",
    "p1", "p2", "p3", "p4", "p5", "p6", "p7"
  ];
  const choice = chooseExchangeTiles(hand, xuezhan, "s");
  assert.equal(choice.suit, "s");
  assert.equal(choice.usesMixedFill, true);
  assert.equal(choice.tiles.length, 3);
  assert.deepEqual(assertExchangeSelection(hand, choice.tiles, xuezhan, "s"), choice.tiles);
});

test("exchange-three rejects another suit when the declared lack suit has three tiles", () => {
  const hand = [
    "m1", "m2", "m3", "m4", "m5",
    "p1", "p2", "p3", "p4", "p5", "p6",
    "s5", "s7", "s8"
  ];
  assert.throws(
    () => assertExchangeSelection(hand, ["m1", "m2", "m3"], xuezhan, "s"),
    /declared lack suit/
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
  assert.equal(score.cappedFan, 4);
});

test("sichuan analysis rejects a missing dingque declaration", () => {
  assert.throws(
    () => analyzeHand({ hand: ["m1"], visibleTiles: [] }, xuezhan),
    /lackSuit is required/
  );
});
