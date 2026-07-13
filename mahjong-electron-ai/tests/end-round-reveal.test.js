const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const clientDirectory = path.join(__dirname, "../client");
const renderer = fs.readFileSync(path.join(clientDirectory, "renderer.js"), "utf8");
const css = fs.readFileSync(path.join(clientDirectory, "styles.css"), "utf8");

test("opponent hands stay hidden during play and reveal after the round", () => {
  assert.match(renderer, /const revealHand = state\.roundOver;/);
  assert.match(
    renderer,
    /revealHand\s*\? state\.hands\[playerIndex\]\.map\(\(tile\) => createRevealedHandTile\(tile, playerIndex\)\)\s*: state\.hands\[playerIndex\]\.map\(createTileBack\)/
  );
  assert.match(renderer, /handNode\.classList\.toggle\("revealed-hand", revealHand\)/);
});

test("revealed opponent tiles use each player's dingque suit", () => {
  assert.match(renderer, /function createRevealedHandTile\(tile, playerIndex\)/);
  assert.match(renderer, /const lackSuit = state\.lackSuits\[playerIndex\];/);
  assert.match(renderer, /lackSuit !== null && TILE_BY_ID\[tile\]\.suitKey === lackSuit/);
});

test("side-seat revealed hands keep the compact vertical layout", () => {
  assert.match(css, /\.closed-hand\.vertical\.revealed-hand \.revealed-hand-tile\s*\{[^}]*margin-block:\s*-4\.5px;/s);
  assert.match(css, /\.opponent-left \.revealed-hand-tile\s*\{[^}]*transform:\s*rotate\(90deg\);/s);
  assert.match(css, /\.opponent-right \.revealed-hand-tile\s*\{[^}]*transform:\s*rotate\(-90deg\);/s);
});
