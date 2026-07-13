const test = require("node:test");
const assert = require("node:assert/strict");
const {
  operationPatternForWin,
  rootCountForWin,
  scoreAmount
} = require("../client/win-scoring");
const { getRuleset } = require("../server/rulesets");

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
