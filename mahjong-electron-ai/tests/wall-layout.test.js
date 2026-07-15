const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const renderer = fs.readFileSync(path.join(__dirname, "../client/renderer.js"), "utf8");
const css = fs.readFileSync(path.join(__dirname, "../client/styles.css"), "utf8");

function loadCreateWallStack() {
  const sourceMatch = renderer.match(/function createWallTile\(\)[\s\S]*?\n}\n\nfunction createWallStack\(tileCount\)[\s\S]*?\n}/);
  assert.notEqual(sourceMatch, null);
  class FakeElement {
    constructor() {
      this.className = "";
      this.classes = [];
      this.children = [];
      this.classList = { add: (...classNames) => this.classes.push(...classNames) };
    }

    append(child) {
      this.children.push(child);
    }
  }
  const context = {
    document: { createElement: () => new FakeElement() },
    result: null
  };
  vm.runInNewContext(`${sourceMatch[0]}; result = createWallStack;`, context);
  return context.result;
}

test("remaining wall tiles are grouped into aligned two-tile stacks", () => {
  assert.match(renderer, /function createWallStack\(tileCount\)[\s\S]*?tileCount < 1 \|\| tileCount > 2/);
  assert.match(renderer, /stack\.className = "wall-stack"/);
  assert.match(renderer, /tileIndex === 1 \? "wall-tile-front" : "wall-tile-back"/);
  assert.match(renderer, /const stackCount = Math\.ceil\(counts\[playerIndex\] \/ 2\)/);
  assert.match(renderer, /createWallStack\(Math\.min\(2, counts\[playerIndex\] - stackIndex \* 2\)\)/);
});

test("drawing removes the upper wall tile before the lower tile", () => {
  const createWallStack = loadCreateWallStack();
  const fullStack = createWallStack(2);
  const remainingSingleTile = createWallStack(1);

  assert.deepEqual(fullStack.children.map((tile) => tile.classes[0]), [
    "wall-tile-back",
    "wall-tile-front"
  ]);
  assert.deepEqual(remainingSingleTile.children.map((tile) => tile.classes[0]), [
    "wall-tile-back"
  ]);
});

test("horizontal and side walls keep each stack compact and mirrored", () => {
  assert.match(css, /\.wall-tiles\s*\{[^}]*display:\s*flex;[^}]*transform-style:\s*preserve-3d;/s);
  assert.match(css, /\.wall-tiles-horizontal \.wall-stack\s*\{[^}]*width:\s*23px;[^}]*height:\s*44px;/s);
  assert.match(css, /\.wall-tiles-vertical \.wall-stack\s*\{[^}]*width:\s*44px;[^}]*height:\s*23px;/s);
  assert.match(css, /\.wall-tiles-vertical \.wall-tile\s*\{[^}]*width:\s*33px;[^}]*height:\s*24px;/s);
  assert.match(css, /\.wall-tiles-horizontal \.wall-tile-back\s*\{[^}]*top:\s*9px;[^}]*z-index:\s*1;/s);
  assert.match(css, /\.wall-tiles-horizontal \.wall-tile-front\s*\{[^}]*top:\s*0;[^}]*z-index:\s*2;/s);
  assert.match(css, /\.wall-tiles-vertical \.wall-tile::after\s*\{[^}]*right:\s*0;[^}]*bottom:\s*-6px;[^}]*left:\s*0;[^}]*height:\s*6px;/s);
  assert.match(css, /\.wall-segment-left \.wall-tile-front::after\s*\{\s*right:\s*-6px;\s*\}/);
  assert.match(css, /\.wall-segment-right \.wall-tile-front::after\s*\{\s*left:\s*-6px;\s*\}/);
  assert.match(css, /\.wall-tiles-vertical \.wall-tile-back\s*\{\s*top:\s*6px;\s*\}/);
  assert.match(css, /\.wall-segment-left \.wall-tile-back\s*\{[^}]*left:\s*6px;[^}]*z-index:\s*1;/s);
  assert.match(css, /\.wall-segment-left \.wall-tile-front\s*\{[^}]*left:\s*0;[^}]*z-index:\s*2;/s);
  assert.match(css, /\.wall-segment-right \.wall-tile-back\s*\{[^}]*left:\s*0;[^}]*z-index:\s*1;/s);
  assert.match(css, /\.wall-segment-right \.wall-tile-front\s*\{[^}]*left:\s*6px;[^}]*z-index:\s*2;/s);
  assert.match(css, /\.opponent-left \.closed-hand\s*\{[^}]*rotateZ\(6deg\) rotateY\(9deg\)/s);
  assert.match(css, /\.opponent-right \.closed-hand\s*\{[^}]*rotateZ\(-6deg\) rotateY\(-9deg\)/s);
  assert.match(css, /\.wall-segment-left \.wall-tiles\s*\{[^}]*transform:\s*rotateZ\(6deg\);/s);
  assert.match(css, /\.wall-segment-right \.wall-tiles\s*\{[^}]*transform:\s*rotateZ\(-6deg\);/s);
  assert.match(css, /\.wall-segment-left \.wall-tile\s*\{[^}]*8px 0 0 #c8d4c9,/s);
  assert.match(css, /\.wall-segment-right \.wall-tile\s*\{[^}]*-8px 0 0 #c8d4c9,/s);
});
