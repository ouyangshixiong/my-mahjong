const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const css = fs.readFileSync(path.join(__dirname, "../client/styles.css"), "utf8");

test("top opponent melds stay to the left of the concealed hand", () => {
  assert.match(
    css,
    /\.opponent-top \.melds\s*\{[^}]*top:\s*0;[^}]*right:\s*calc\(100% \+ 12px\);[^}]*width:\s*250px;[^}]*justify-content:\s*flex-start;/s
  );
});

test("right opponent melds dock below the hand without overflowing toward the self hand", () => {
  assert.match(
    css,
    /\.opponent-right \.melds\s*\{[^}]*right:\s*105px;[^}]*bottom:\s*-104px;[^}]*width:\s*360px;[^}]*flex-wrap:\s*wrap;/s
  );
  assert.match(css, /@media \(max-height:\s*760px\)[\s\S]*?\.opponent-right \.melds\s*\{\s*bottom:\s*-60px;\s*\}/);
  assert.match(css, /@media \(max-width:\s*1500px\)[\s\S]*?\.opponent-right \.melds\s*\{[^}]*right:\s*10px;[^}]*width:\s*230px;/s);
  assert.match(css, /@media \(max-width:\s*1160px\)[\s\S]*?\.opponent-right \.melds\s*\{[^}]*right:\s*0;[^}]*width:\s*210px;/s);
});
