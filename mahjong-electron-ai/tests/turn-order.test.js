const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  TURN_ORDER,
  seatAfter,
  turnIndicatorFor,
  turnOrderFrom
} = require("../client/turn-order");

test("Mahjong turns run counterclockwise from East to South, West, and North", () => {
  assert.deepEqual(TURN_ORDER, [0, 3, 2, 1]);
  assert.deepEqual(turnOrderFrom(0), [0, 3, 2, 1]);
  assert.deepEqual(turnOrderFrom(3), [3, 2, 1, 0]);
  assert.equal(seatAfter(0, 1), 3);
  assert.equal(seatAfter(0, 4), 0);
});

test("seat winds match the dealer and relative player positions", () => {
  const html = fs.readFileSync(path.join(__dirname, "../client/index.html"), "utf8");
  assert.match(html, /seat-avatar avatar-self">东</);
  assert.match(html, /seat-avatar avatar-right">南</);
  assert.match(html, /seat-avatar avatar-top">西</);
  assert.match(html, /seat-avatar avatar-left">北</);
  assert.match(html, /wind wind-bottom">东</);
  assert.match(html, /wind wind-right">南</);
  assert.match(html, /wind wind-top">西</);
  assert.match(html, /wind wind-left">北</);
});

test("turn indicator maps every seat to its visible table direction", () => {
  assert.deepEqual(
    [0, 1, 2, 3].map((playerIndex) => turnIndicatorFor(playerIndex).direction),
    ["bottom", "left", "top", "right"]
  );
  assert.deepEqual(
    TURN_ORDER.map((playerIndex) => turnIndicatorFor(playerIndex).direction),
    ["bottom", "right", "top", "left"]
  );
  assert.equal(turnIndicatorFor(null), null);
});

test("turn indicator markup is accessible and hidden until play begins", () => {
  const html = fs.readFileSync(path.join(__dirname, "../client/index.html"), "utf8");
  assert.equal((html.match(/id="turnIndicator"/g) || []).length, 1);
  assert.match(html, /id="turnIndicator"[^>]*hidden[^>]*role="status"[^>]*aria-live="polite"/);
  assert.equal((html.match(/id="turnIndicatorLabel"/g) || []).length, 1);
});

test("discard rivers share the center field and face their owning seats", () => {
  const html = fs.readFileSync(path.join(__dirname, "../client/index.html"), "utf8");
  const css = fs.readFileSync(path.join(__dirname, "../client/styles.css"), "utf8");
  assert.match(html, /class="discard-field"[\s\S]*id="player2River" class="river river-top"[\s\S]*id="player1River" class="river river-left"[\s\S]*id="player3River" class="river river-right"[\s\S]*id="selfRiver" class="river river-self"/);
  for (const riverId of ["selfRiver", "player1River", "player2River", "player3River"]) {
    assert.equal((html.match(new RegExp(`id="${riverId}"`, "g")) || []).length, 1);
  }
  assert.match(css, /\.discard-field \.river\s*\{[^}]*grid-template-columns:\s*repeat\(6, 28px\)/s);
  assert.match(css, /\.discard-field \.river-self\s*\{[^}]*transform:\s*translate\(-50%, -50%\);/s);
  assert.match(css, /\.discard-field \.river-left\s*\{[^}]*rotate\(90deg\);/s);
  assert.match(css, /\.discard-field \.river-top\s*\{[^}]*rotate\(180deg\);/s);
  assert.match(css, /\.discard-field \.river-right\s*\{[^}]*rotate\(-90deg\);/s);
});

test("turn order rejects invalid seat data", () => {
  assert.throws(() => turnOrderFrom(-1), /playerIndex/);
  assert.throws(() => seatAfter(0, -1), /turn distance/);
  assert.throws(() => turnIndicatorFor(4), /playerIndex/);
  assert.throws(() => turnIndicatorFor(undefined), /playerIndex/);
});
