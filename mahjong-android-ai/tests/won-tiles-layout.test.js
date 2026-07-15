const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const clientDirectory = path.join(__dirname, "../client");
const html = fs.readFileSync(path.join(clientDirectory, "index.html"), "utf8");
const renderer = fs.readFileSync(path.join(clientDirectory, "renderer.js"), "utf8");
const css = fs.readFileSync(path.join(clientDirectory, "styles.css"), "utf8");

function loadCalculateWonTileGrid() {
  const start = renderer.indexOf("function calculateWonTileGrid");
  const end = renderer.indexOf("\nfunction layoutWonTileTray", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  return vm.runInNewContext(`(${renderer.slice(start, end)})`);
}

test("winning tiles render in four independent trays", () => {
  for (const trayId of ["selfWonTiles", "player1WonTiles", "player2WonTiles", "player3WonTiles"]) {
    assert.equal((html.match(new RegExp(`id="${trayId}"`, "g")) || []).length, 1);
  }
  assert.match(html, /id="player1Hand"[\s\S]*id="player1WonTiles" class="won-tiles won-tiles-left won-tiles-vertical"/);
  assert.match(html, /id="player3Hand"[\s\S]*id="player3WonTiles" class="won-tiles won-tiles-right won-tiles-vertical"/);
  assert.match(renderer, /createTile\(tile, "small", null\)[\s\S]*element\.classList\.add\("won-tile"\)/);
  assert.match(renderer, /replaceChildren\(nodes\.selfHand, handTiles\);[\s\S]*renderWonTiles\(0\);/);
  assert.doesNotMatch(renderer, /renderedHandTiles/);
});

test("new winning tiles receive a temporary hu effect", () => {
  assert.match(renderer, /winEffects:\s*\[null, null, null, null\]/);
  assert.match(renderer, /function triggerWinEffect\(playerIndex, winIndex, tile\)/);
  assert.match(renderer, /state\.wonTiles\[entry\.playerIndex\]\.push\(winningTile\);\s*triggerWinEffect\(/);
  assert.match(renderer, /element\.classList\.add\("won-tile-effect"\)/);
  assert.match(css, /\.won-tile-effect\s*\{[^}]*animation:\s*won-tile-impact 1\.8s/s);
  assert.match(css, /\.won-tile-effect::after\s*\{[^}]*content:\s*"胡"/s);
  assert.match(css, /\.won-tiles-vertical \.won-tile-effect::after\s*\{[^}]*won-side-tile-label/s);
});

test("one-discard multi-wins play a dedicated table announcement before player win voices", () => {
  assert.equal(fs.existsSync(path.join(clientDirectory, "../assets/sounds/nv/effects/one-discard-two-winners.wav")), true);
  assert.equal(fs.existsSync(path.join(clientDirectory, "../assets/sounds/nv/effects/one-discard-three-winners.wav")), true);
  assert.match(renderer, /"一炮双响": "\.\.\/assets\/sounds\/nv\/effects\/one-discard-two-winners\.wav"/);
  assert.match(renderer, /"一炮三响": "\.\.\/assets\/sounds\/nv\/effects\/one-discard-three-winners\.wav"/);
  assert.match(renderer, /settlement\.source === "river" && scoredEntries\.length > 1/);
  assert.match(renderer, /await playMultipleWinnerAnnouncement\(scoredEntries\.length\);[\s\S]*for \(const entry of scoredEntries\)/);
});

test("winning tile trays wrap toward the table center", () => {
  assert.match(css, /\.won-tiles\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:/s);
  assert.match(css, /\.won-tiles-left\.won-tiles-wrapped\s*\{\s*left:\s*248px;\s*\}/);
  assert.match(css, /\.won-tiles-right\.won-tiles-wrapped\s*\{\s*right:\s*248px;\s*\}/);
  assert.match(renderer, /playerIndex === 1 \? line \+ 1 : layout\.columns - line/);
  assert.match(renderer, /playerIndex === 2 \? line \+ 1 : layout\.rows - line/);
});

test("side winning tiles share the corresponding hand perspective", () => {
  assert.match(css, /\.won-tiles-left\s*\{[^}]*rotateZ\(6deg\) rotateY\(9deg\)/s);
  assert.match(css, /\.won-tiles-right\s*\{[^}]*rotateZ\(-6deg\) rotateY\(-9deg\)/s);
  assert.match(css, /\.won-tiles-right \.won-tile\s*\{[^}]*rotate\(-90deg\)/s);
  assert.match(css, /\.won-tiles-right \.won-tile::after\s*\{[^}]*rotate\(90deg\)/s);
});

test("grid calculation fits normal, wrapped, and 56-tile stress layouts", () => {
  const calculateWonTileGrid = loadCalculateWonTileGrid();

  assert.deepEqual(
    JSON.parse(JSON.stringify(calculateWonTileGrid(3, true, 80, 290))),
    {
      rows: 3,
      columns: 1,
      scale: 0.9,
      primarySlots: 3,
      unusedSlots: 0,
      cellWidth: 50.4,
      cellHeight: 30.6
    }
  );

  const wrappedSide = calculateWonTileGrid(13, true, 80, 290);
  assert.equal(wrappedSide.columns, 2);
  assert.equal(wrappedSide.rows, 7);
  assert.ok(wrappedSide.columns * wrappedSide.cellWidth <= 80);
  assert.ok(wrappedSide.rows * wrappedSide.cellHeight <= 290);

  const stressedSide = calculateWonTileGrid(56, true, 80, 290);
  assert.ok(stressedSide.columns > 1);
  assert.ok(stressedSide.columns * stressedSide.cellWidth <= 80 + Number.EPSILON);
  assert.ok(stressedSide.rows * stressedSide.cellHeight <= 290 + Number.EPSILON);

  const stressedTop = calculateWonTileGrid(56, false, 204, 108);
  assert.ok(stressedTop.rows > 1);
  assert.ok(stressedTop.columns * stressedTop.cellWidth <= 204 + Number.EPSILON);
  assert.ok(stressedTop.rows * stressedTop.cellHeight <= 108 + Number.EPSILON);
});
