const TILE_DEFS = Object.freeze([
  { id: "m1", rank: "一", suit: "万", suitKey: "m" },
  { id: "m2", rank: "二", suit: "万", suitKey: "m" },
  { id: "m3", rank: "三", suit: "万", suitKey: "m" },
  { id: "m4", rank: "四", suit: "万", suitKey: "m" },
  { id: "m5", rank: "五", suit: "万", suitKey: "m" },
  { id: "m6", rank: "六", suit: "万", suitKey: "m" },
  { id: "m7", rank: "七", suit: "万", suitKey: "m" },
  { id: "m8", rank: "八", suit: "万", suitKey: "m" },
  { id: "m9", rank: "九", suit: "万", suitKey: "m" },
  { id: "p1", rank: "一", suit: "筒", suitKey: "p" },
  { id: "p2", rank: "二", suit: "筒", suitKey: "p" },
  { id: "p3", rank: "三", suit: "筒", suitKey: "p" },
  { id: "p4", rank: "四", suit: "筒", suitKey: "p" },
  { id: "p5", rank: "五", suit: "筒", suitKey: "p" },
  { id: "p6", rank: "六", suit: "筒", suitKey: "p" },
  { id: "p7", rank: "七", suit: "筒", suitKey: "p" },
  { id: "p8", rank: "八", suit: "筒", suitKey: "p" },
  { id: "p9", rank: "九", suit: "筒", suitKey: "p" },
  { id: "s1", rank: "一", suit: "条", suitKey: "s" },
  { id: "s2", rank: "二", suit: "条", suitKey: "s" },
  { id: "s3", rank: "三", suit: "条", suitKey: "s" },
  { id: "s4", rank: "四", suit: "条", suitKey: "s" },
  { id: "s5", rank: "五", suit: "条", suitKey: "s" },
  { id: "s6", rank: "六", suit: "条", suitKey: "s" },
  { id: "s7", rank: "七", suit: "条", suitKey: "s" },
  { id: "s8", rank: "八", suit: "条", suitKey: "s" },
  { id: "s9", rank: "九", suit: "条", suitKey: "s" },
  { id: "z1", rank: "东", suit: "风", suitKey: "z" },
  { id: "z2", rank: "南", suit: "风", suitKey: "z" },
  { id: "z3", rank: "西", suit: "风", suitKey: "z" },
  { id: "z4", rank: "北", suit: "风", suitKey: "z" },
  { id: "z5", rank: "红", suit: "中", suitKey: "z" },
  { id: "z6", rank: "发", suit: "财", suitKey: "z" },
  { id: "z7", rank: "白", suit: "板", suitKey: "z" }
]);

const TILE_IDS = Object.freeze(TILE_DEFS.map((tile) => tile.id));
const TILE_BY_ID = Object.freeze(Object.fromEntries(TILE_DEFS.map((tile) => [tile.id, tile])));
const TILE_ORDER = Object.freeze(Object.fromEntries(TILE_IDS.map((tile, index) => [tile, index])));
const PLAYER_NAMES = Object.freeze(["你", "上家", "对家", "下家"]);
const SUITED_SUITS = Object.freeze(["m", "p", "s"]);
const SUIT_LABELS = Object.freeze({ m: "万", p: "筒", s: "条" });

const state = {
  rulesets: [],
  ruleset: null,
  wall: [],
  hands: [[], [], [], []],
  discards: [[], [], [], []],
  winners: [false, false, false, false],
  winningHands: [null, null, null, null],
  lackSuits: [null, null, null, null],
  awaitingLackSuit: false,
  awaitingPlayerDiscard: false,
  pendingHu: null,
  roundOver: true,
  recommendedTile: null,
  recommendedLackSuit: null,
  messages: []
};

const nodes = {
  roundStatus: mustGet("roundStatus"),
  wallCount: mustGet("wallCount"),
  messageLog: mustGet("messageLog"),
  selfHand: mustGet("selfHand"),
  selfRiver: mustGet("selfRiver"),
  player1Hand: mustGet("player1Hand"),
  player2Hand: mustGet("player2Hand"),
  player3Hand: mustGet("player3Hand"),
  player1River: mustGet("player1River"),
  player2River: mustGet("player2River"),
  player3River: mustGet("player3River"),
  selfLackSuit: mustGet("selfLackSuit"),
  player1LackSuit: mustGet("player1LackSuit"),
  player2LackSuit: mustGet("player2LackSuit"),
  player3LackSuit: mustGet("player3LackSuit"),
  lackSuitPanel: mustGet("lackSuitPanel"),
  advisorContent: mustGet("advisorContent"),
  serviceBadge: mustGet("serviceBadge"),
  rulesetBadge: mustGet("rulesetBadge"),
  rulesetSelect: mustGet("rulesetSelect"),
  updateRulesButton: mustGet("updateRulesButton"),
  newRoundButton: mustGet("newRoundButton"),
  askAiButton: mustGet("askAiButton"),
  huButton: mustGet("huButton"),
  passButton: mustGet("passButton"),
  lackSuitButtons: [...document.querySelectorAll("[data-lack-suit]")]
};

if (nodes.lackSuitButtons.length !== SUITED_SUITS.length) {
  throw new Error("Expected exactly three dingque buttons");
}

function mustGet(id) {
  const element = document.getElementById(id);
  if (element === null) {
    throw new Error(`Missing DOM node: ${id}`);
  }
  return element;
}

function assertRuleset(ruleset) {
  if (ruleset === null || typeof ruleset !== "object") {
    throw new Error("ruleset must be an object");
  }
  for (const field of ["id", "version", "name", "tileCounts", "gameplay", "scoring"]) {
    if (!Object.prototype.hasOwnProperty.call(ruleset, field)) {
      throw new Error(`ruleset missing field: ${field}`);
    }
  }
  if (!Object.prototype.hasOwnProperty.call(ruleset.gameplay, "wildcardTile")) {
    throw new Error(`ruleset ${ruleset.id} missing wildcardTile`);
  }
  for (const field of [
    "requiresDingque",
    "mustDiscardDingqueFirst",
    "allowDiscardWin",
    "allowMultipleWinnersOnDiscard",
    "forceWinOnLastFourTiles",
    "settleFlowerPigOnDraw",
    "settleReadyHandsOnDraw"
  ]) {
    if (!Object.prototype.hasOwnProperty.call(ruleset.gameplay, field)) {
      throw new Error(`ruleset ${ruleset.id} missing gameplay.${field}`);
    }
  }
  if (!Array.isArray(ruleset.scoring.patterns)) {
    throw new Error(`ruleset ${ruleset.id} scoring.patterns must be an array`);
  }
  if (ruleset.scoring.aggregation !== "sum" && ruleset.scoring.aggregation !== "highest") {
    throw new Error(`ruleset ${ruleset.id} scoring.aggregation must be sum or highest`);
  }
}

function currentRuleset() {
  assertRuleset(state.ruleset);
  return state.ruleset;
}

function allowedTileIds(ruleset) {
  assertRuleset(ruleset);
  return Object.keys(ruleset.tileCounts).sort((left, right) => TILE_ORDER[left] - TILE_ORDER[right]);
}

function buildWall(ruleset) {
  const wall = [];
  for (const [tile, count] of Object.entries(ruleset.tileCounts)) {
    if (!Object.prototype.hasOwnProperty.call(TILE_BY_ID, tile)) {
      throw new Error(`Unknown tile in ruleset: ${tile}`);
    }
    if (!Number.isInteger(count) || count < 1) {
      throw new Error(`Invalid tile count for ${tile}`);
    }
    for (let copy = 0; copy < count; copy += 1) {
      wall.push(tile);
    }
  }
  return shuffle(wall);
}

function shuffle(tiles) {
  const shuffled = [...tiles];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    const value = shuffled[index];
    shuffled[index] = shuffled[swapIndex];
    shuffled[swapIndex] = value;
  }
  return shuffled;
}

function randomInt(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive < 1) {
    throw new Error("maxExclusive must be a positive integer");
  }
  const buffer = new Uint32Array(1);
  window.crypto.getRandomValues(buffer);
  return buffer[0] % maxExclusive;
}

function sortTiles(tiles) {
  return [...tiles].sort((left, right) => TILE_ORDER[left] - TILE_ORDER[right]);
}

function drawTile(playerIndex) {
  if (state.wall.length === 0) {
    return null;
  }
  const tile = state.wall.pop();
  state.hands[playerIndex].push(tile);
  state.hands[playerIndex] = sortTiles(state.hands[playerIndex]);
  return tile;
}

function removeOne(hand, tile) {
  const next = [...hand];
  const index = next.indexOf(tile);
  if (index === -1) {
    throw new Error(`Cannot discard missing tile: ${tile}`);
  }
  next.splice(index, 1);
  return next;
}

function visibleTiles() {
  return state.discards.flat();
}

function countTilesLocal(tiles, ruleset) {
  const counts = Object.fromEntries(allowedTileIds(ruleset).map((tile) => [tile, 0]));
  for (const tile of tiles) {
    if (!Object.prototype.hasOwnProperty.call(counts, tile)) {
      throw new Error(`Tile ${tile} is not allowed by ruleset ${ruleset.id}`);
    }
    counts[tile] += 1;
  }
  return counts;
}

function splitWildcardCountsLocal(hand, ruleset) {
  const counts = countTilesLocal(hand, ruleset);
  const wildcardTile = ruleset.gameplay.wildcardTile;
  if (wildcardTile !== null) {
    if (!Object.prototype.hasOwnProperty.call(counts, wildcardTile)) {
      throw new Error(`Wildcard tile ${wildcardTile} is not in ruleset ${ruleset.id}`);
    }
    const wildcards = counts[wildcardTile];
    counts[wildcardTile] = 0;
    return { counts, wildcards };
  }
  return { counts, wildcards: 0 };
}

function suitedSuitsInHandLocal(hand, ruleset) {
  const wildcardTile = ruleset.gameplay.wildcardTile;
  const suits = new Set();
  for (const tile of hand) {
    if (tile === wildcardTile) {
      continue;
    }
    const def = TILE_BY_ID[tile];
    if (def.suitKey !== "z") {
      suits.add(def.suitKey);
    }
  }
  return suits;
}

function lacksOneSuitLocal(hand, ruleset) {
  return suitedSuitsInHandLocal(hand, ruleset).size <= 2;
}

function assertLackSuitLocal(lackSuit, ruleset) {
  if (ruleset.gameplay.requiresDingque) {
    if (!SUITED_SUITS.includes(lackSuit)) {
      throw new Error(`玩法 ${ruleset.id} 要求定缺为万、筒或条`);
    }
    return;
  }
  if (lackSuit !== null) {
    throw new Error(`玩法 ${ruleset.id} 不使用定缺`);
  }
}

function suitLabelLocal(suit) {
  const label = SUIT_LABELS[suit];
  if (label === undefined) {
    throw new Error(`Unknown suited Mahjong suit: ${suit}`);
  }
  return label;
}

function countSuitTilesLocal(hand, suit) {
  if (!SUITED_SUITS.includes(suit)) {
    throw new Error(`suit must be m, p, or s: ${suit}`);
  }
  return hand.filter((tile) => TILE_BY_ID[tile].suitKey === suit).length;
}

function hasDingqueTilesLocal(hand, ruleset, lackSuit) {
  assertLackSuitLocal(lackSuit, ruleset);
  return ruleset.gameplay.requiresDingque && hand.some((tile) => TILE_BY_ID[tile].suitKey === lackSuit);
}

function legalDiscardTilesLocal(hand, ruleset, lackSuit) {
  assertLackSuitLocal(lackSuit, ruleset);
  const uniqueTiles = [...new Set(sortTiles(hand))];
  if (!ruleset.gameplay.mustDiscardDingqueFirst || !hasDingqueTilesLocal(hand, ruleset, lackSuit)) {
    return uniqueTiles;
  }
  return uniqueTiles.filter((tile) => TILE_BY_ID[tile].suitKey === lackSuit);
}

function canFormSevenPairsLocal(hand, ruleset) {
  const tiles = sortTiles(hand);
  if (tiles.length !== 14) {
    return false;
  }
  const { counts, wildcards } = splitWildcardCountsLocal(tiles, ruleset);
  let pairs = 0;
  let singles = 0;
  for (const tile of allowedTileIds(ruleset)) {
    if (tile === ruleset.gameplay.wildcardTile) {
      continue;
    }
    pairs += Math.floor(counts[tile] / 2);
    singles += counts[tile] % 2;
  }
  if (singles > wildcards) {
    return false;
  }
  const remainingWildcards = wildcards - singles;
  pairs += singles + Math.floor(remainingWildcards / 2);
  return pairs >= 7;
}

function firstCountedTileLocal(counts, ruleset) {
  return allowedTileIds(ruleset).find((tile) => counts[tile] > 0);
}

function canFormMeldsLocal(counts, wildcards, ruleset) {
  const tile = firstCountedTileLocal(counts, ruleset);
  if (tile === undefined) {
    return wildcards % 3 === 0;
  }

  const tripletActual = Math.min(counts[tile], 3);
  const tripletNeed = 3 - tripletActual;
  if (tripletNeed <= wildcards) {
    counts[tile] -= tripletActual;
    if (canFormMeldsLocal(counts, wildcards - tripletNeed, ruleset)) {
      counts[tile] += tripletActual;
      return true;
    }
    counts[tile] += tripletActual;
  }

  const def = TILE_BY_ID[tile];
  if (def.suitKey !== "z") {
    const rank = Number.parseInt(tile.slice(1), 10);
    if (rank <= 7) {
      const second = `${def.suitKey}${rank + 1}`;
      const third = `${def.suitKey}${rank + 2}`;
      if (Object.prototype.hasOwnProperty.call(counts, second) && Object.prototype.hasOwnProperty.call(counts, third)) {
        const secondActual = counts[second] > 0 ? 1 : 0;
        const thirdActual = counts[third] > 0 ? 1 : 0;
        const sequenceNeed = 2 - secondActual - thirdActual;
        if (sequenceNeed <= wildcards) {
          counts[tile] -= 1;
          counts[second] -= secondActual;
          counts[third] -= thirdActual;
          if (canFormMeldsLocal(counts, wildcards - sequenceNeed, ruleset)) {
            counts[tile] += 1;
            counts[second] += secondActual;
            counts[third] += thirdActual;
            return true;
          }
          counts[tile] += 1;
          counts[second] += secondActual;
          counts[third] += thirdActual;
        }
      }
    }
  }
  return false;
}

function canFormTripletMeldsLocal(counts, wildcards, ruleset) {
  const tile = firstCountedTileLocal(counts, ruleset);
  if (tile === undefined) {
    return wildcards % 3 === 0;
  }
  const actual = Math.min(counts[tile], 3);
  const need = 3 - actual;
  if (need > wildcards) {
    return false;
  }
  counts[tile] -= actual;
  const matched = canFormTripletMeldsLocal(counts, wildcards - need, ruleset);
  counts[tile] += actual;
  return matched;
}

function isAllTripletsLocal(hand, ruleset) {
  const tiles = sortTiles(hand);
  if (tiles.length % 3 !== 2) {
    return false;
  }
  const { counts, wildcards } = splitWildcardCountsLocal(tiles, ruleset);
  for (const tile of allowedTileIds(ruleset)) {
    if (tile === ruleset.gameplay.wildcardTile) {
      continue;
    }
    const actual = Math.min(counts[tile], 2);
    const need = 2 - actual;
    if (need <= wildcards) {
      counts[tile] -= actual;
      if (canFormTripletMeldsLocal(counts, wildcards - need, ruleset)) {
        counts[tile] += actual;
        return true;
      }
      counts[tile] += actual;
    }
  }
  if (wildcards >= 2) {
    return canFormTripletMeldsLocal(counts, wildcards - 2, ruleset);
  }
  return false;
}

function isPureSuitLocal(hand, ruleset) {
  const wildcardTile = ruleset.gameplay.wildcardTile;
  const suits = new Set();
  for (const tile of hand) {
    if (tile === wildcardTile) {
      continue;
    }
    const def = TILE_BY_ID[tile];
    if (def.suitKey === "z") {
      return false;
    }
    suits.add(def.suitKey);
  }
  return suits.size === 1;
}

function isWinningHandLocal(hand, ruleset, lackSuit) {
  const tiles = sortTiles(hand);
  assertLackSuitLocal(lackSuit, ruleset);
  if (tiles.length % 3 !== 2) {
    return false;
  }
  if (ruleset.gameplay.requiresDingque && hasDingqueTilesLocal(tiles, ruleset, lackSuit)) {
    return false;
  }
  if (canFormSevenPairsLocal(tiles, ruleset)) {
    return true;
  }

  const { counts, wildcards } = splitWildcardCountsLocal(tiles, ruleset);
  for (const tile of allowedTileIds(ruleset)) {
    if (tile === ruleset.gameplay.wildcardTile) {
      continue;
    }
    const actual = Math.min(counts[tile], 2);
    const need = 2 - actual;
    if (need <= wildcards) {
      counts[tile] -= actual;
      if (canFormMeldsLocal(counts, wildcards - need, ruleset)) {
        counts[tile] += actual;
        return true;
      }
      counts[tile] += actual;
    }
  }
  if (wildcards >= 2) {
    return canFormMeldsLocal(counts, wildcards - 2, ruleset);
  }
  return false;
}

function winningTilesLocal(hand, visible, ruleset, lackSuit) {
  if (hand.length % 3 !== 1) {
    throw new Error("winningTilesLocal requires a 3n+1 tile hand");
  }
  const counts = countTilesLocal([...hand, ...visible], ruleset);
  const wins = [];
  for (const tile of allowedTileIds(ruleset)) {
    const remaining = ruleset.tileCounts[tile] - counts[tile];
    if (remaining > 0 && isWinningHandLocal([...hand, tile], ruleset, lackSuit)) {
      wins.push({ tile, remaining });
    }
  }
  return wins;
}

function scoreHandLocal(hand, ruleset, lackSuit) {
  if (!isWinningHandLocal(hand, ruleset, lackSuit)) {
    return { isWinning: false, totalFan: 0, cappedFan: 0, patterns: [] };
  }
  const patterns = [];
  for (const pattern of ruleset.scoring.patterns) {
    const result = matchScoringPatternLocal(pattern, hand, ruleset);
    if (result.matched) {
      patterns.push({
        id: pattern.id,
        name: pattern.name,
        fan: result.fan,
        type: pattern.type
      });
    }
  }
  const appliedPatterns = ruleset.scoring.aggregation === "highest"
    ? patterns.filter((pattern) => pattern.fan === Math.max(...patterns.map((item) => item.fan))).slice(0, 1)
    : patterns;
  const totalFan = appliedPatterns.reduce((total, pattern) => total + pattern.fan, 0);
  return {
    isWinning: true,
    totalFan,
    cappedFan: Math.min(totalFan, ruleset.scoring.maxFan),
    patterns: appliedPatterns
  };
}

function matchScoringPatternLocal(pattern, hand, ruleset) {
  if (pattern.type === "base") {
    return { matched: true, fan: pattern.fan };
  }
  if (pattern.type === "allTriplets") {
    return { matched: isAllTripletsLocal(hand, ruleset), fan: pattern.fan };
  }
  if (pattern.type === "pureSuit") {
    return { matched: isPureSuitLocal(hand, ruleset), fan: pattern.fan };
  }
  if (pattern.type === "sevenPairs") {
    return { matched: canFormSevenPairsLocal(hand, ruleset), fan: pattern.fan };
  }
  if (pattern.type === "pureSevenPairs") {
    return { matched: canFormSevenPairsLocal(hand, ruleset) && isPureSuitLocal(hand, ruleset), fan: pattern.fan };
  }
  if (pattern.type === "lacksOneSuit") {
    return { matched: lacksOneSuitLocal(hand, ruleset), fan: pattern.fan };
  }
  if (pattern.type === "wildcardEach") {
    const wildcardTile = ruleset.gameplay.wildcardTile;
    if (wildcardTile === null) {
      return { matched: false, fan: 0 };
    }
    const wildcardCount = hand.filter((tile) => tile === wildcardTile).length;
    return { matched: wildcardCount > 0, fan: wildcardCount * pattern.fan };
  }
  throw new Error(`Unknown scoring pattern type: ${pattern.type}`);
}

function logMessage(message) {
  state.messages.unshift(message);
  state.messages = state.messages.slice(0, 6);
  nodes.messageLog.innerHTML = state.messages.map((item) => `<div>${escapeHtml(item)}</div>`).join("");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function tileLabel(tile) {
  const def = TILE_BY_ID[tile];
  if (def === undefined) {
    throw new Error(`Unknown tile: ${tile}`);
  }
  return `${def.rank}${def.suit}`;
}

function createTile(tile, size, interactive, blockedByDingque = false) {
  const def = TILE_BY_ID[tile];
  if (def === undefined) {
    throw new Error(`Unknown tile: ${tile}`);
  }
  const element = document.createElement(interactive ? "button" : "div");
  element.className = `tile suit-${def.suitKey}`;
  if (size === "small") {
    element.classList.add("small");
  }
  if (tile === state.ruleset.gameplay.wildcardTile) {
    element.classList.add("wildcard");
  }
  if (state.lackSuits[0] !== null && def.suitKey === state.lackSuits[0]) {
    element.classList.add("dingque-tile");
  }
  if (blockedByDingque) {
    element.classList.add("blocked-by-dingque");
    element.title = `必须先打完定缺${suitLabelLocal(state.lackSuits[0])}`;
  }
  if (interactive) {
    element.classList.add("interactive");
    element.type = "button";
    element.addEventListener("click", () => {
      runAsync(() => discardSelf(tile));
    });
  }
  if (state.recommendedTile === tile && interactive) {
    element.classList.add("recommended");
  }

  const rank = document.createElement("span");
  rank.className = "rank";
  rank.textContent = def.rank;
  const suit = document.createElement("span");
  suit.className = "suit";
  suit.textContent = def.suit;
  element.append(rank, suit);
  return element;
}

function createTileBack() {
  const element = document.createElement("div");
  element.className = "tile-back";
  return element;
}

function replaceChildren(node, children) {
  node.replaceChildren(...children);
}

function render() {
  const ruleset = state.ruleset;
  nodes.wallCount.textContent = String(state.wall.length);
  nodes.rulesetBadge.textContent = ruleset === null ? "玩法未加载" : `${ruleset.name} v${ruleset.version}`;
  nodes.roundStatus.textContent = roundStatusText();

  const canDiscard = canSelfDiscard();
  const legalDiscards = canDiscard ? new Set(legalDiscardTilesLocal(state.hands[0], ruleset, state.lackSuits[0])) : new Set();
  const forcingDingque = canDiscard && hasDingqueTilesLocal(state.hands[0], ruleset, state.lackSuits[0]);
  replaceChildren(nodes.selfHand, state.hands[0].map((tile) => createTile(
    tile,
    "normal",
    canDiscard && legalDiscards.has(tile),
    forcingDingque && !legalDiscards.has(tile)
  )));
  replaceChildren(nodes.selfRiver, state.discards[0].map((tile) => createTile(tile, "small", false)));

  for (const playerIndex of [1, 2, 3]) {
    const handNode = nodes[`player${playerIndex}Hand`];
    const riverNode = nodes[`player${playerIndex}River`];
    replaceChildren(handNode, state.hands[playerIndex].map(createTileBack));
    replaceChildren(riverNode, state.discards[playerIndex].map((tile) => createTile(tile, "small", false)));
  }

  nodes.selfLackSuit.textContent = formatLackSuit(0);
  nodes.player1LackSuit.textContent = formatLackSuit(1, true);
  nodes.player2LackSuit.textContent = formatLackSuit(2, true);
  nodes.player3LackSuit.textContent = formatLackSuit(3, true);
  nodes.lackSuitPanel.hidden = !state.awaitingLackSuit;
  for (const button of nodes.lackSuitButtons) {
    button.classList.toggle("recommended", button.dataset.lackSuit === state.recommendedLackSuit);
  }

  nodes.askAiButton.disabled = !canDiscard && !state.awaitingLackSuit;
  nodes.huButton.disabled = !canDiscard && state.pendingHu === null;
  nodes.passButton.disabled = state.pendingHu === null;
  nodes.newRoundButton.disabled = state.ruleset === null;
  nodes.updateRulesButton.disabled = false;
  nodes.rulesetSelect.disabled = state.rulesets.length === 0;
}

function formatLackSuit(playerIndex, includePrefix = false) {
  const ruleset = state.ruleset;
  if (ruleset === null || !ruleset.gameplay.requiresDingque) {
    return includePrefix ? "" : "本玩法无定缺";
  }
  const lackSuit = state.lackSuits[playerIndex];
  if (lackSuit === null) {
    return includePrefix ? "" : "未定";
  }
  const text = `缺${suitLabelLocal(lackSuit)}`;
  return includePrefix ? `· ${text}` : text;
}

function roundStatusText() {
  if (state.ruleset === null) {
    return "正在加载玩法";
  }
  if (state.roundOver) {
    return `${state.ruleset.name}：牌局结束`;
  }
  if (state.awaitingLackSuit) {
    return `${state.ruleset.name}：请选择定缺`;
  }
  if (state.pendingHu !== null) {
    return `${state.ruleset.name}：${PLAYER_NAMES[state.pendingHu.discarderIndex]}打出${tileLabel(state.pendingHu.tile)}，可胡或过`;
  }
  const winnerNames = PLAYER_NAMES.filter((_name, index) => state.winners[index]);
  const winnerSuffix = winnerNames.length > 0 ? `，已胡：${winnerNames.join("、")}` : "";
  if (state.awaitingPlayerDiscard) {
    return `${state.ruleset.name}：轮到你出牌${winnerSuffix}`;
  }
  return `${state.ruleset.name}：AI 行动中${winnerSuffix}`;
}

function canSelfDiscard() {
  return state.ruleset !== null
    && !state.roundOver
    && !state.awaitingLackSuit
    && state.pendingHu === null
    && state.awaitingPlayerDiscard
    && !state.winners[0];
}

async function loadRulesets() {
  const response = await window.mahjongAI.getRulesets();
  if (!Array.isArray(response.rulesets) || response.rulesets.length === 0) {
    throw new Error("server returned no rulesets");
  }
  for (const ruleset of response.rulesets) {
    assertRuleset(ruleset);
  }

  const previousRulesetId = state.ruleset === null ? null : state.ruleset.id;
  state.rulesets = response.rulesets;
  populateRulesetSelect();

  if (previousRulesetId === null) {
    state.ruleset = state.rulesets[0];
    nodes.rulesetSelect.value = state.ruleset.id;
  } else {
    const updated = state.rulesets.find((ruleset) => ruleset.id === previousRulesetId);
    if (updated === undefined) {
      throw new Error(`current ruleset disappeared from server: ${previousRulesetId}`);
    }
    state.ruleset = updated;
    nodes.rulesetSelect.value = state.ruleset.id;
  }
  render();
}

function populateRulesetSelect() {
  const options = state.rulesets.map((ruleset) => {
    const option = document.createElement("option");
    option.value = ruleset.id;
    option.textContent = `${ruleset.name} v${ruleset.version}`;
    return option;
  });
  replaceChildren(nodes.rulesetSelect, options);
}

async function changeRuleset(rulesetId) {
  const response = await window.mahjongAI.getRuleset(rulesetId);
  assertRuleset(response.ruleset);
  state.ruleset = response.ruleset;
  nodes.rulesetSelect.value = state.ruleset.id;
  logMessage(`切换到 ${state.ruleset.name} v${state.ruleset.version}。`);
  await startRound();
}

async function updateRulesets() {
  const before = state.ruleset === null ? "未加载" : `${state.ruleset.name} v${state.ruleset.version}`;
  await loadRulesets();
  const after = `${state.ruleset.name} v${state.ruleset.version}`;
  logMessage(`玩法已更新：${before} -> ${after}。`);
  await startRound();
}

async function startRound() {
  const ruleset = currentRuleset();
  state.wall = buildWall(ruleset);
  state.hands = [[], [], [], []];
  state.discards = [[], [], [], []];
  state.winners = [false, false, false, false];
  state.winningHands = [null, null, null, null];
  state.lackSuits = [null, null, null, null];
  state.awaitingLackSuit = false;
  state.awaitingPlayerDiscard = false;
  state.pendingHu = null;
  state.roundOver = false;
  state.recommendedTile = null;
  state.recommendedLackSuit = null;
  state.messages = [];

  for (let round = 0; round < ruleset.gameplay.initialHandSize; round += 1) {
    for (let playerIndex = 0; playerIndex < 4; playerIndex += 1) {
      drawTile(playerIndex);
    }
  }
  for (let drawIndex = ruleset.gameplay.initialHandSize; drawIndex < ruleset.gameplay.dealerDraws; drawIndex += 1) {
    drawTile(0);
  }

  logMessage(`新牌局开始：${ruleset.description}`);
  if (ruleset.gameplay.requiresDingque) {
    const botChoices = await Promise.all([1, 2, 3].map((playerIndex) => window.mahjongAI.chooseLackSuit({
      rulesetId: ruleset.id,
      hand: state.hands[playerIndex]
    })));
    for (let index = 0; index < botChoices.length; index += 1) {
      state.lackSuits[index + 1] = botChoices[index].lackSuit;
    }
    state.awaitingLackSuit = true;
    logMessage("请选择定缺花色；定缺牌未打完前，只能先打该花色。");
    renderLackSuitAdvisor(null);
    render();
    return;
  }

  state.awaitingPlayerDiscard = true;
  render();
  await refreshAnalysis();
}

async function declareLackSuit(lackSuit) {
  const ruleset = currentRuleset();
  if (!state.awaitingLackSuit) {
    throw new Error("当前不在定缺阶段");
  }
  assertLackSuitLocal(lackSuit, ruleset);
  state.lackSuits[0] = lackSuit;
  state.awaitingLackSuit = false;
  state.awaitingPlayerDiscard = true;
  state.recommendedLackSuit = null;
  logMessage(`你定缺${suitLabelLocal(lackSuit)}。`);
  logMessage(`上家缺${suitLabelLocal(state.lackSuits[1])}，对家缺${suitLabelLocal(state.lackSuits[2])}，下家缺${suitLabelLocal(state.lackSuits[3])}。`);
  render();
  await refreshAnalysis();
}

async function discardSelf(tile) {
  if (!canSelfDiscard()) {
    return;
  }
  const ruleset = currentRuleset();
  const legalDiscards = legalDiscardTilesLocal(state.hands[0], ruleset, state.lackSuits[0]);
  if (!legalDiscards.includes(tile)) {
    throw new Error(`定缺${suitLabelLocal(state.lackSuits[0])}未打完，不能打${tileLabel(tile)}`);
  }
  state.recommendedTile = null;
  state.hands[0] = removeOne(state.hands[0], tile);
  state.discards[0].push(tile);
  state.awaitingPlayerDiscard = false;
  logMessage(`你打出 ${tileLabel(tile)}。`);
  render();
  await resolveDiscardWins(0, tile);
  if (!state.roundOver && state.pendingHu === null) {
    await advanceFrom(0);
  }
}

async function advanceFrom(previousPlayerIndex) {
  const ruleset = currentRuleset();
  let previous = previousPlayerIndex;
  while (!state.roundOver && state.pendingHu === null) {
    const playerIndex = nextActivePlayer(previous);
    if (playerIndex === null) {
      endRound("牌局结束：没有可继续行动的玩家。");
      return;
    }

    const drawn = drawTile(playerIndex);
    if (drawn === null) {
      await finishDrawRound();
      return;
    }

    if (playerIndex === 0) {
      logMessage(`你摸到 ${tileLabel(drawn)}。`);
      if (
        ruleset.gameplay.forceWinOnLastFourTiles
        && state.wall.length < 4
        && isWinningHandLocal(state.hands[0], ruleset, state.lackSuits[0])
      ) {
        await registerWin(0, state.hands[0], "最后四张强制自摸胡牌。");
        previous = 0;
        continue;
      }
      state.awaitingPlayerDiscard = true;
      render();
      await refreshAnalysis();
      return;
    }

    render();
    await sleep(220);

    const decision = await window.mahjongAI.recommendDiscard({
      rulesetId: ruleset.id,
      hand: state.hands[playerIndex],
      visibleTiles: visibleTiles(),
      lackSuit: state.lackSuits[playerIndex]
    });

    if (decision.action === "hu") {
      await registerWin(playerIndex, state.hands[playerIndex], `${PLAYER_NAMES[playerIndex]} 自摸胡牌。`);
      previous = playerIndex;
      continue;
    }

    const legalDiscards = legalDiscardTilesLocal(state.hands[playerIndex], ruleset, state.lackSuits[playerIndex]);
    if (!legalDiscards.includes(decision.discard)) {
      throw new Error(`${PLAYER_NAMES[playerIndex]} 的 AI 返回了非法定缺出牌 ${decision.discard}`);
    }
    state.hands[playerIndex] = removeOne(state.hands[playerIndex], decision.discard);
    state.discards[playerIndex].push(decision.discard);
    logMessage(`${PLAYER_NAMES[playerIndex]} 打出 ${decision.discardLabel}。`);
    render();
    await sleep(220);
    await resolveDiscardWins(playerIndex, decision.discard);
    previous = playerIndex;
  }
}

function nextActivePlayer(playerIndex) {
  for (let offset = 1; offset <= 4; offset += 1) {
    const candidate = (playerIndex + offset) % 4;
    if (!state.winners[candidate]) {
      return candidate;
    }
  }
  return null;
}

function playersAfter(playerIndex) {
  return [1, 2, 3].map((offset) => (playerIndex + offset) % 4);
}

async function resolveDiscardWins(discarderIndex, tile) {
  const ruleset = currentRuleset();
  if (!ruleset.gameplay.allowDiscardWin) {
    return;
  }

  let candidates = playersAfter(discarderIndex).filter((playerIndex) => {
    if (state.winners[playerIndex]) {
      return false;
    }
    return isWinningHandLocal(
      [...state.hands[playerIndex], tile],
      ruleset,
      state.lackSuits[playerIndex]
    );
  });
  if (!ruleset.gameplay.allowMultipleWinnersOnDiscard) {
    candidates = candidates.slice(0, 1);
  }
  if (candidates.length === 0) {
    return;
  }

  const forceWin = ruleset.gameplay.forceWinOnLastFourTiles && state.wall.length < 4;
  for (const playerIndex of candidates.filter((candidate) => candidate !== 0)) {
    await registerWin(
      playerIndex,
      [...state.hands[playerIndex], tile],
      `${PLAYER_NAMES[playerIndex]} 胡了${PLAYER_NAMES[discarderIndex]}打出的${tileLabel(tile)}。`
    );
  }

  if (candidates.includes(0) && !state.roundOver) {
    const winningHand = [...state.hands[0], tile];
    if (forceWin) {
      await registerWin(0, winningHand, `最后四张强制胡${PLAYER_NAMES[discarderIndex]}打出的${tileLabel(tile)}。`);
      return;
    }
    state.pendingHu = { discarderIndex, tile, winningHand };
    logMessage(`${PLAYER_NAMES[discarderIndex]}打出${tileLabel(tile)}，你可以胡牌或选择过。`);
    render();
  }
}

async function askAi() {
  const ruleset = currentRuleset();
  if (state.awaitingLackSuit) {
    const choice = await window.mahjongAI.chooseLackSuit({
      rulesetId: ruleset.id,
      hand: state.hands[0]
    });
    state.recommendedLackSuit = choice.lackSuit;
    renderLackSuitAdvisor(choice);
    render();
    return;
  }
  if (!canSelfDiscard()) {
    throw new Error("当前不能请求出牌建议");
  }
  const decision = await window.mahjongAI.recommendDiscard({
    rulesetId: ruleset.id,
    hand: state.hands[0],
    visibleTiles: visibleTiles(),
    lackSuit: state.lackSuits[0]
  });
  state.recommendedTile = decision.action === "discard" ? decision.discard : null;
  renderAdvisor(decision.analysis, decision, scoreHandLocal(state.hands[0], ruleset, state.lackSuits[0]));
  render();
}

async function refreshAnalysis() {
  const ruleset = currentRuleset();
  const analysis = await window.mahjongAI.analyze({
    rulesetId: ruleset.id,
    hand: state.hands[0],
    visibleTiles: visibleTiles(),
    lackSuit: state.lackSuits[0]
  });
  renderAdvisor(analysis, null, scoreHandLocal(state.hands[0], ruleset, state.lackSuits[0]));
}

async function claimHu() {
  const ruleset = currentRuleset();
  if (state.pendingHu !== null) {
    const pendingHu = state.pendingHu;
    state.pendingHu = null;
    await registerWin(
      0,
      pendingHu.winningHand,
      `你胡了${PLAYER_NAMES[pendingHu.discarderIndex]}打出的${tileLabel(pendingHu.tile)}。`
    );
    if (!state.roundOver) {
      await advanceFrom(pendingHu.discarderIndex);
    }
    return;
  }

  if (!canSelfDiscard()) {
    throw new Error("当前不能胡牌");
  }
  if (isWinningHandLocal(state.hands[0], ruleset, state.lackSuits[0])) {
    const localScore = scoreHandLocal(state.hands[0], ruleset, state.lackSuits[0]);
    await registerWin(0, state.hands[0], "你自摸胡牌了。");
    const analysis = await window.mahjongAI.analyze({
      rulesetId: ruleset.id,
      hand: state.hands[0],
      visibleTiles: visibleTiles(),
      lackSuit: state.lackSuits[0]
    });
    renderAdvisor(analysis, null, localScore);
    if (!state.roundOver) {
      await advanceFrom(0);
    }
    return;
  }
  const analysis = await window.mahjongAI.analyze({
    rulesetId: ruleset.id,
    hand: state.hands[0],
    visibleTiles: visibleTiles(),
    lackSuit: state.lackSuits[0]
  });
  if (analysis.lackSuitRemaining > 0) {
    logMessage(`还不能胡：定缺${analysis.lackSuitLabel}仍有 ${analysis.lackSuitRemaining} 张。`);
  } else {
    logMessage(`还不能胡，当前约 ${analysis.estimatedShanten} 向听。`);
  }
  renderAdvisor(analysis, null, scoreHandLocal(state.hands[0], ruleset, state.lackSuits[0]));
}

async function passHu() {
  if (state.pendingHu === null) {
    throw new Error("当前没有可跳过的胡牌机会");
  }
  const pendingHu = state.pendingHu;
  state.pendingHu = null;
  logMessage(`你选择过${tileLabel(pendingHu.tile)}。`);
  render();
  await advanceFrom(pendingHu.discarderIndex);
}

async function registerWin(playerIndex, winningHand, message) {
  const ruleset = currentRuleset();
  const score = scoreHandLocal(winningHand, ruleset, state.lackSuits[playerIndex]);
  if (!score.isWinning) {
    throw new Error(`${PLAYER_NAMES[playerIndex]} 的胡牌不符合当前规则`);
  }
  state.winners[playerIndex] = true;
  state.winningHands[playerIndex] = sortTiles(winningHand);
  state.awaitingPlayerDiscard = false;
  logMessage(`${message} ${score.cappedFan} 番：${score.patterns.map((pattern) => pattern.name).join("、")}。`);
  if (!ruleset.gameplay.continueAfterWin || state.winners.filter(Boolean).length >= ruleset.gameplay.maxWinners) {
    endRound("牌局结束。");
    return;
  }
  render();
}

async function finishDrawRound() {
  const ruleset = currentRuleset();
  const activePlayers = [0, 1, 2, 3].filter((playerIndex) => !state.winners[playerIndex]);
  const flowerPigs = ruleset.gameplay.settleFlowerPigOnDraw
    ? activePlayers.filter((playerIndex) => hasDingqueTilesLocal(
      state.hands[playerIndex],
      ruleset,
      state.lackSuits[playerIndex]
    ))
    : [];
  if (ruleset.gameplay.settleFlowerPigOnDraw) {
    logMessage(flowerPigs.length > 0
      ? `流局查花猪：${flowerPigs.map((playerIndex) => PLAYER_NAMES[playerIndex]).join("、")}。`
      : "流局查花猪：无人花猪。");
  }

  if (ruleset.gameplay.settleReadyHandsOnDraw) {
    const eligiblePlayers = activePlayers.filter((playerIndex) => !flowerPigs.includes(playerIndex));
    const readyPlayers = eligiblePlayers.filter((playerIndex) => winningTilesLocal(
      state.hands[playerIndex],
      visibleTiles(),
      ruleset,
      state.lackSuits[playerIndex]
    ).length > 0);
    const notReadyPlayers = eligiblePlayers.filter((playerIndex) => !readyPlayers.includes(playerIndex));
    logMessage(`流局查大叫：已听 ${readyPlayers.length > 0 ? readyPlayers.map((playerIndex) => PLAYER_NAMES[playerIndex]).join("、") : "无"}；未听 ${notReadyPlayers.length > 0 ? notReadyPlayers.map((playerIndex) => PLAYER_NAMES[playerIndex]).join("、") : "无"}。`);
  }
  endRound("流局：牌墙已经摸完，完成查花猪/查大叫。");
}

function renderLackSuitAdvisor(choice) {
  const counts = SUITED_SUITS.map((suit) => `缺${suitLabelLocal(suit)}：手中 ${countSuitTilesLocal(state.hands[0], suit)} 张`).join("；");
  const ranking = choice === null
    ? ""
    : choice.ranked.map((item) => `<li>缺${escapeHtml(item.label)}：${item.tileCount} 张，保留结构分 ${item.remainingShapeScore}</li>`).join("");
  nodes.advisorContent.innerHTML = `
    <div class="advisor-card">
      <h2>定缺阶段</h2>
      <p>${escapeHtml(counts)}</p>
      <p>选定后不可更改；手里仍有定缺花色时，只能优先打该花色，且不能胡牌。</p>
    </div>
    <div class="advisor-card">
      <h2>${choice === null ? "请选择缺门" : "AI 定缺建议"}</h2>
      ${choice === null ? "<p>可以直接选择，或点击“AI 建议”。</p>" : `<p>${escapeHtml(choice.reason)}</p><ul>${ranking}</ul>`}
    </div>
  `;
}

function renderAdvisor(analysis, decision, localScore) {
  const waits = analysis.waits.map((wait) => `${wait.label}x${wait.remaining}`).join("、");
  const ready = analysis.readyDiscards
    .slice(0, 6)
    .map((item) => `<li>打 ${escapeHtml(item.discardLabel)}：${escapeHtml(item.waits.map((wait) => `${wait.label}x${wait.remaining}`).join("、"))}</li>`)
    .join("");
  const ranked = decision === null
    ? ""
    : decision.ranked.slice(0, 6).map((item) => `<li>${escapeHtml(item.discardLabel)}：${item.score} 分，${escapeHtml(item.reason)}</li>`).join("");
  const scoreText = localScore.isWinning
    ? `${localScore.cappedFan} 番：${localScore.patterns.map((pattern) => `${pattern.name}+${pattern.fan}`).join("、")}`
    : "未成胡牌";
  const dingqueText = analysis.lackSuit === null
    ? "本玩法无定缺"
    : `定缺${analysis.lackSuitLabel}，尚余 ${analysis.lackSuitRemaining} 张`;
  const legalDiscardText = analysis.legalDiscards.length === 0
    ? "无"
    : analysis.legalDiscards.map(tileLabel).join("、");

  nodes.advisorContent.innerHTML = `
    <div class="advisor-card">
      <h2>手牌状态</h2>
      <p>张数：${analysis.tileCount}</p>
      <p>向听：${analysis.estimatedShanten}</p>
      <p>形状分：${analysis.shapeScore}</p>
      <p>定缺：${escapeHtml(dingqueText)}</p>
      <p>当前合法出牌：${escapeHtml(legalDiscardText)}</p>
      <p>胡牌：${analysis.isWinning ? "是" : "否"}</p>
      <p>算番：${escapeHtml(scoreText)}</p>
      <p>直接听牌：${waits.length > 0 ? escapeHtml(waits) : "无"}</p>
    </div>
    <div class="advisor-card">
      <h2>${decision === null ? "进张/改良" : "AI 出牌排序"}</h2>
      ${decision === null ? `<ul>${ready}</ul>` : `<p>${escapeHtml(decision.reason)}</p><ul>${ranked}</ul>`}
    </div>
  `;
}

function endRound(message) {
  state.roundOver = true;
  state.awaitingPlayerDiscard = false;
  logMessage(message);
  render();
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function runAsync(task) {
  task().catch((error) => {
    logMessage(`错误：${error.message}`);
    nodes.serviceBadge.textContent = "AI 服务错误";
    render();
  });
}

nodes.newRoundButton.addEventListener("click", () => {
  runAsync(startRound);
});
nodes.askAiButton.addEventListener("click", () => {
  runAsync(askAi);
});
nodes.huButton.addEventListener("click", () => {
  runAsync(claimHu);
});
nodes.passButton.addEventListener("click", () => {
  runAsync(passHu);
});
for (const button of nodes.lackSuitButtons) {
  button.addEventListener("click", () => {
    runAsync(() => declareLackSuit(button.dataset.lackSuit));
  });
}
nodes.updateRulesButton.addEventListener("click", () => {
  runAsync(updateRulesets);
});
nodes.rulesetSelect.addEventListener("change", () => {
  runAsync(() => changeRuleset(nodes.rulesetSelect.value));
});

nodes.serviceBadge.textContent = `AI 服务 ${window.mahjongAI.serviceUrl}`;
runAsync(async () => {
  await loadRulesets();
  await startRound();
});
