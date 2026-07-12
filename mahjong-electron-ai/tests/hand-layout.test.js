const test = require("node:test");
const assert = require("node:assert/strict");
const { arrangeHandForDrawPreview } = require("../client/hand-layout");

test("draw preview moves exactly one matching tile to the far left", () => {
  const hand = ["m1", "m2", "m2", "m3"];
  const entries = arrangeHandForDrawPreview(hand, "m2");

  assert.deepEqual(hand, ["m1", "m2", "m2", "m3"]);
  assert.deepEqual(entries.map((entry) => entry.tile), ["m2", "m1", "m2", "m3"]);
  assert.deepEqual(entries.map((entry) => entry.isDrawnTile), [true, false, false, false]);
});

test("hand order remains unchanged after the draw preview ends", () => {
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
