const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const css = fs.readFileSync(path.join(__dirname, "../client/styles.css"), "utf8");
const renderer = fs.readFileSync(path.join(__dirname, "../client/renderer.js"), "utf8");

test("top opponent melds stay to the left of the concealed hand", () => {
  assert.match(
    css,
    /\.opponent-top \.melds\s*\{[^}]*top:\s*0;[^}]*right:\s*calc\(100% \+ 12px\);[^}]*width:\s*250px;[^}]*justify-content:\s*flex-start;/s
  );
});

test("side opponent melds rotate ninety degrees toward their owning seats", () => {
  assert.match(renderer, /side-meld side-meld-\$\{playerIndex === 1 \? "left" : "right"\}/);
  assert.match(css, /\.side-meld-left > \.meld\s*\{[^}]*rotate:\s*90deg;/s);
  assert.match(css, /\.side-meld-right > \.meld\s*\{[^}]*rotate:\s*-90deg;/s);
  assert.match(
    css,
    /\.side-meld\s*\{[^}]*width:\s*54px;[^}]*height:\s*112px;/s
  );
});

test("side opponent melds stack vertically and wrap after three groups", () => {
  assert.match(
    css,
    /\.opponent-left \.melds,\s*\.opponent-right \.melds\s*\{[^}]*width:\s*116px;[^}]*height:\s*352px;[^}]*flex-flow:\s*column wrap;/s
  );
  assert.match(
    css,
    /\.opponent-right \.melds\s*\{[^}]*right:\s*105px;[^}]*bottom:\s*-104px;[^}]*align-content:\s*flex-end;/s
  );
  assert.match(css, /@media \(max-height:\s*760px\)[\s\S]*?\.opponent-right \.melds\s*\{\s*bottom:\s*-60px;\s*\}/);
  assert.match(css, /@media \(max-width:\s*1500px\)[\s\S]*?\.opponent-right \.melds\s*\{[^}]*right:\s*10px;/s);
  assert.match(css, /@media \(max-width:\s*1160px\)[\s\S]*?\.opponent-right \.melds\s*\{[^}]*right:\s*0;/s);
});
