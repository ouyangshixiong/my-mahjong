const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const renderer = fs.readFileSync(path.join(__dirname, "../client/renderer.js"), "utf8");

function functionSource(name, nextName) {
  const declaration = name === "resolveDiscardActions" || name === "resolveMeldClaims"
    || name === "claimPeng" || name === "claimGang" || name === "passAction"
    ? `async function ${name}`
    : `function ${name}`;
  const nextDeclaration = nextName.startsWith("async ")
    ? nextName
    : `function ${nextName}`;
  const start = renderer.indexOf(declaration);
  const end = renderer.indexOf(nextDeclaration, start);
  assert.notEqual(start, -1, `${name} must exist`);
  assert.notEqual(end, -1, `${nextName} must follow ${name}`);
  return renderer.slice(start, end);
}

test("a discard that can hu also retains its legal peng option", () => {
  const source = functionSource("discardMeldOptions", "async function resolveDiscardActions");
  const discardMeldOptions = new Function(
    "currentRuleset",
    "canUseExposedMeld",
    "countHandTile",
    "canClaimPeng",
    "canClaimDiscardGang",
    `${source}; return discardMeldOptions;`
  )(
    () => ({ gameplay: { allowPeng: true, allowGang: true } }),
    () => true,
    (_playerIndex, tile) => tile === "s9" ? 2 : 0,
    () => true,
    () => false
  );

  assert.deepEqual(discardMeldOptions(0, "s9"), { canPeng: true, canGang: false });

  const resolveSource = functionSource("resolveDiscardActions", "async function resolveMeldClaims");
  assert.match(resolveSource, /const meldOptions = botWinnerIndices\.length === 0/);
  assert.match(resolveSource, /state\.pendingHu = \{[\s\S]*\.\.\.meldOptions/);
});

test("hu, peng and gang buttons share the pending discard response", () => {
  const renderSource = functionSource("render", "formatLackSuit");

  assert.match(renderSource, /state\.pendingHu\.type === "discard" && state\.pendingHu\.canPeng/);
  assert.match(renderSource, /state\.pendingHu\.type === "discard" && state\.pendingHu\.canGang/);
});

test("choosing peng or gang directly consumes the pending hu response", () => {
  const pengSource = functionSource("claimPeng", "async function claimGang");
  const gangSource = functionSource("claimGang", "async function passAction");

  assert.match(pengSource, /state\.pendingHu\.type === "discard" && state\.pendingHu\.canPeng/);
  assert.match(pengSource, /await executePeng\(0, pendingHu\.discarderIndex, pendingHu\.tile\)/);
  assert.match(gangSource, /state\.pendingHu\.type === "discard" && state\.pendingHu\.canGang/);
  assert.match(gangSource, /await executeDiscardGang\(0, pendingHu\.discarderIndex, pendingHu\.tile\)/);
});

test("passing the combined response does not offer the same player peng again", () => {
  const passSource = functionSource("passAction", "async function registerWins");
  const meldSource = functionSource("resolveMeldClaims", "async function executePeng");

  assert.match(passSource, /resolveMeldClaims\(pendingHu\.discarderIndex, pendingHu\.tile, \[0\]\)/);
  assert.match(meldSource, /excludedPlayerIndices\.includes\(playerIndex\)/);
});
