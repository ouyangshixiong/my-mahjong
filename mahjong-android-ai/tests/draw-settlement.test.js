const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { getRuleset } = require("../game/rulesets");

const renderer = fs.readFileSync(path.join(__dirname, "../client/renderer.js"), "utf8");

function loadDrawSettlementPlayerIndices() {
  const start = renderer.indexOf("function drawSettlementPlayerIndices");
  const end = renderer.indexOf("\nfunction applyScoreChange", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  return vm.runInNewContext(`(${renderer.slice(start, end)})`, {
    PLAYER_NAMES: ["self", "upper", "opposite", "lower"]
  });
}

test("server-downloaded blood-flow rules exclude winners from draw settlement", () => {
  const drawSettlementPlayerIndices = loadDrawSettlementPlayerIndices();
  const ruleset = getRuleset("sichuan-xueliu");

  assert.equal(ruleset.gameplay.drawSettlementPlayerScope, "nonWinners");
  assert.deepEqual(
    Array.from(drawSettlementPlayerIndices(
      [0, 1, 2, 3],
      [true, false, false, false],
      ruleset.gameplay.drawSettlementPlayerScope
    )),
    [1, 2, 3]
  );
});

test("draw settlement behavior follows the explicit server scope", () => {
  const drawSettlementPlayerIndices = loadDrawSettlementPlayerIndices();

  assert.deepEqual(
    Array.from(drawSettlementPlayerIndices(
      [0, 1, 2, 3],
      [false, false, false, false],
      "none"
    )),
    []
  );
  assert.deepEqual(
    Array.from(drawSettlementPlayerIndices(
      [0, 1, 2, 3],
      [true, false, false, false],
      "activePlayers"
    )),
    [0, 1, 2, 3]
  );
});

test("draw settlement rejects unknown server scopes and invalid player state", () => {
  const drawSettlementPlayerIndices = loadDrawSettlementPlayerIndices();

  assert.throws(
    () => drawSettlementPlayerIndices([0], [false, false, false, false], "legacyDefault"),
    /unknown draw settlement player scope/
  );
  assert.throws(
    () => drawSettlementPlayerIndices([0, 0], [false, false, false, false], "nonWinners"),
    /duplicate/
  );
  assert.throws(
    () => drawSettlementPlayerIndices([4], [false, false, false, false], "nonWinners"),
    /invalid active player index/
  );
  assert.throws(
    () => drawSettlementPlayerIndices([0], [false, false, false], "nonWinners"),
    /exactly 4/
  );
});
