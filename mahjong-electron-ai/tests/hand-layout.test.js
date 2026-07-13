const test = require("node:test");
const assert = require("node:assert/strict");
const { arrangeHandForDrawPreview } = require("../client/hand-layout");

test("draw preview moves exactly one matching tile to the far right", () => {
  const hand = ["m1", "m2", "m2", "m3"];
  const entries = arrangeHandForDrawPreview(hand, "m2");

  assert.deepEqual(hand, ["m1", "m2", "m2", "m3"]);
  assert.deepEqual(entries.map((entry) => entry.tile), ["m1", "m2", "m3", "m2"]);
  assert.deepEqual(entries.map((entry) => entry.isDrawnTile), [false, false, false, true]);
});

test("hand order remains unchanged when there is no current drawn tile", () => {
  assert.deepEqual(
    arrangeHandForDrawPreview(["m1", "m2", "m3"], null),
    [
      { tile: "m1", isDrawnTile: false },
      { tile: "m2", isDrawnTile: false },
      { tile: "m3", isDrawnTile: false }
    ]
  );
});

test("draw preview rejects state that does not contain the drawn tile", () => {
  assert.throws(
    () => arrangeHandForDrawPreview(["m1", "m2"], "m3"),
    /missing from hand/
  );
});
