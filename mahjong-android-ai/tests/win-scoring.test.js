const test = require("node:test");
const assert = require("node:assert/strict");
const {
  announcementPatternsForWin,
  declaredGangPatternForWin,
  displayPatternNamesForWin,
  multipleWinnerAnnouncementForCount,
  operationPatternForWin,
  rootCountForWin,
  scoreAmount,
  winContextAfterDiscard
} = require("../game/win-scoring");
const { getRuleset } = require("../game/rulesets");

const xueliu = getRuleset("sichuan-xueliu");

test("ordinary self draw adds exactly one fan", () => {
  assert.deepEqual(
    operationPatternForWin("selfDraw", null, xueliu.scoring),
    { id: "selfDraw", name: "自摸", fan: 1, type: "winOperation" }
  );
});

test("special self draws replace the ordinary self-draw fan", () => {
  assert.equal(operationPatternForWin("selfDraw", "haiDi", xueliu.scoring), null);
  assert.equal(operationPatternForWin("selfDraw", "gangShangHua", xueliu.scoring), null);
});

test("discard wins do not add a self-draw fan", () => {
  assert.equal(operationPatternForWin("discard", null, xueliu.scoring), null);
  assert.equal(operationPatternForWin("discard", "qiangGang", xueliu.scoring), null);
});

test("hai di only applies when the last wall tile wins by self draw", () => {
  assert.equal(winContextAfterDiscard("haiDi"), null);
  assert.equal(winContextAfterDiscard(null), null);
  assert.equal(winContextAfterDiscard("gangShangHua"), "gangShangPao");
  assert.throws(
    () => operationPatternForWin("discard", "haiDi", xueliu.scoring),
    /requires a self-draw settlement/
  );
});

test("plain self draws announce 自摸 instead of 平胡", () => {
  assert.deepEqual(announcementPatternsForWin([
    { id: "baseHu", name: "平胡", fan: 0, type: "base" },
    { id: "selfDraw", name: "自摸", fan: 1, type: "winOperation" }
  ]), [
    { id: "selfDraw", name: "自摸", fan: 1, type: "winOperation" }
  ]);
});

test("plain discard wins still announce 平胡", () => {
  assert.deepEqual(announcementPatternsForWin([
    { id: "baseHu", name: "平胡", fan: 0, type: "base" }
  ]), [
    { id: "baseHu", name: "平胡", fan: 0, type: "base" }
  ]);
});

test("discard multi-wins announce one discard with two or three winners", () => {
  assert.equal(multipleWinnerAnnouncementForCount(1), null);
  assert.equal(multipleWinnerAnnouncementForCount(2), "一炮双响");
  assert.equal(multipleWinnerAnnouncementForCount(3), "一炮三响");
  assert.throws(() => multipleWinnerAnnouncementForCount(0), /integer from 1 to 3/);
  assert.throws(() => multipleWinnerAnnouncementForCount(4), /integer from 1 to 3/);
});

test("special patterns take announcement priority over self draw", () => {
  assert.deepEqual(announcementPatternsForWin([
    { id: "baseHu", name: "平胡", fan: 0, type: "base" },
    { id: "qingYiSe", name: "清一色", fan: 2, type: "pureSuit" },
    { id: "selfDraw", name: "自摸", fan: 1, type: "winOperation" }
  ]), [
    { id: "qingYiSe", name: "清一色", fan: 2, type: "pureSuit" }
  ]);
});

test("score history displays plain wins as 平胡 without the self-draw operation", () => {
  assert.deepEqual(displayPatternNamesForWin([
    { id: "baseHu", name: "平胡", fan: 0, type: "base" },
    { id: "selfDraw", name: "自摸", fan: 1, type: "winOperation" }
  ]), ["平胡"]);
});

test("score history displays special win patterns by fan from high to low", () => {
  assert.deepEqual(displayPatternNamesForWin([
    { id: "baseHu", name: "平胡", fan: 0, type: "base" },
    { id: "duiDuiHu", name: "对对胡", fan: 1, type: "allTriplets" },
    { id: "qingYiSe", name: "清一色", fan: 2, type: "pureSuit" },
    { id: "selfDraw", name: "自摸", fan: 1, type: "winOperation" }
  ]), ["清一色", "对对胡"]);
});

test("all wins use the same exponential fan formula", () => {
  assert.equal(scoreAmount(xueliu.scoring, 0), 100);
  assert.equal(scoreAmount(xueliu.scoring, 1), 200);
  assert.equal(scoreAmount(xueliu.scoring, 3), 800);
  assert.equal(scoreAmount(xueliu.scoring, 4), 1600);
});

test("declared gangs settle separately and are not counted as roots", () => {
  assert.equal(rootCountForWin([], [{ type: "gang", tiles: ["m1", "m1", "m1", "m1"] }]), 0);
  assert.equal(rootCountForWin(
    ["m1"],
    [{ type: "peng", tiles: ["m1", "m1", "m1"] }]
  ), 1);
});

test("each declared gang adds one fan to later wins", () => {
  const oneGang = declaredGangPatternForWin([
    { type: "gang", tiles: ["s9", "s9", "s9", "s9"] }
  ]);
  const twoGangs = declaredGangPatternForWin([
    { type: "gang", tiles: ["s9", "s9", "s9", "s9"] },
    { type: "peng", tiles: ["m1", "m1", "m1"] },
    { type: "gang", tiles: ["p5", "p5", "p5", "p5"] }
  ]);

  assert.deepEqual(oneGang, { id: "gang", name: "杠x1", fan: 1, type: "gangEach" });
  assert.deepEqual(twoGangs, { id: "gang", name: "杠x2", fan: 2, type: "gangEach" });
  assert.equal(scoreAmount(xueliu.scoring, oneGang.fan), 200);
  assert.equal(scoreAmount(xueliu.scoring, twoGangs.fan), 400);
});

test("wins without a declared gang do not gain gang fan", () => {
  assert.equal(declaredGangPatternForWin([]), null);
  assert.equal(declaredGangPatternForWin([
    { type: "peng", tiles: ["m1", "m1", "m1"] }
  ]), null);
});

test("documented popular combinations keep their expected multipliers", () => {
  const qingYiSeFan = 2;
  const operationFan = operationPatternForWin("selfDraw", null, xueliu.scoring).fan;
  const haiDiFan = 1;
  const gangShangHuaFan = 1;
  const rootFan = 1;

  assert.equal(scoreAmount(xueliu.scoring, qingYiSeFan + operationFan), 800);
  assert.equal(scoreAmount(xueliu.scoring, qingYiSeFan + haiDiFan), 800);
  assert.equal(scoreAmount(xueliu.scoring, qingYiSeFan + gangShangHuaFan), 800);
  assert.equal(scoreAmount(xueliu.scoring, qingYiSeFan + operationFan + rootFan), 1600);
  assert.equal(scoreAmount(xueliu.scoring, qingYiSeFan + haiDiFan + rootFan), 1600);
});

test("sichuan rules allow the documented sixteen-times combinations", () => {
  assert.equal(xueliu.scoring.maxFan, 5);
  assert.ok(xueliu.scoring.maxFan >= 4);
});
