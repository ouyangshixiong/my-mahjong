const TILE_DEFS = Object.freeze([
  { id: "m1", label: "一万", suit: "m", rank: 1 },
  { id: "m2", label: "二万", suit: "m", rank: 2 },
  { id: "m3", label: "三万", suit: "m", rank: 3 },
  { id: "m4", label: "四万", suit: "m", rank: 4 },
  { id: "m5", label: "五万", suit: "m", rank: 5 },
  { id: "m6", label: "六万", suit: "m", rank: 6 },
  { id: "m7", label: "七万", suit: "m", rank: 7 },
  { id: "m8", label: "八万", suit: "m", rank: 8 },
  { id: "m9", label: "九万", suit: "m", rank: 9 },
  { id: "p1", label: "一筒", suit: "p", rank: 1 },
  { id: "p2", label: "二筒", suit: "p", rank: 2 },
  { id: "p3", label: "三筒", suit: "p", rank: 3 },
  { id: "p4", label: "四筒", suit: "p", rank: 4 },
  { id: "p5", label: "五筒", suit: "p", rank: 5 },
  { id: "p6", label: "六筒", suit: "p", rank: 6 },
  { id: "p7", label: "七筒", suit: "p", rank: 7 },
  { id: "p8", label: "八筒", suit: "p", rank: 8 },
  { id: "p9", label: "九筒", suit: "p", rank: 9 },
  { id: "s1", label: "一条", suit: "s", rank: 1 },
  { id: "s2", label: "二条", suit: "s", rank: 2 },
  { id: "s3", label: "三条", suit: "s", rank: 3 },
  { id: "s4", label: "四条", suit: "s", rank: 4 },
  { id: "s5", label: "五条", suit: "s", rank: 5 },
  { id: "s6", label: "六条", suit: "s", rank: 6 },
  { id: "s7", label: "七条", suit: "s", rank: 7 },
  { id: "s8", label: "八条", suit: "s", rank: 8 },
  { id: "s9", label: "九条", suit: "s", rank: 9 },
  { id: "z1", label: "东", suit: "z", rank: 1 },
  { id: "z2", label: "南", suit: "z", rank: 2 },
  { id: "z3", label: "西", suit: "z", rank: 3 },
  { id: "z4", label: "北", suit: "z", rank: 4 },
  { id: "z5", label: "中", suit: "z", rank: 5 },
  { id: "z6", label: "发", suit: "z", rank: 6 },
  { id: "z7", label: "白", suit: "z", rank: 7 }
]);

const TILE_IDS = Object.freeze(TILE_DEFS.map((tile) => tile.id));
const TILE_BY_ID = Object.freeze(Object.fromEntries(TILE_DEFS.map((tile) => [tile.id, tile])));
const TILE_ORDER = Object.freeze(Object.fromEntries(TILE_IDS.map((tile, index) => [tile, index])));
const SUITED_SUITS = Object.freeze(["m", "p", "s"]);
const SUIT_LABELS = Object.freeze({ m: "万", p: "筒", s: "条" });

function assertRuleset(ruleset) {
  if (ruleset === null || typeof ruleset !== "object") {
    throw new Error("ruleset must be an object");
  }
  for (const field of ["id", "tileCounts", "gameplay", "scoring"]) {
    if (!Object.prototype.hasOwnProperty.call(ruleset, field)) {
      throw new Error(`ruleset missing field: ${field}`);
    }
  }
  if (!Object.prototype.hasOwnProperty.call(ruleset.gameplay, "wildcardTile")) {
    throw new Error(`ruleset ${ruleset.id} missing gameplay.wildcardTile`);
  }
  for (const field of ["requiresDingque", "mustDiscardDingqueFirst"]) {
    if (!Object.prototype.hasOwnProperty.call(ruleset.gameplay, field)) {
      throw new Error(`ruleset ${ruleset.id} missing gameplay.${field}`);
    }
  }
}

function assertLackSuit(lackSuit, ruleset) {
  assertRuleset(ruleset);
  if (ruleset.gameplay.requiresDingque) {
    if (!SUITED_SUITS.includes(lackSuit)) {
      throw new Error(`ruleset ${ruleset.id} requires lackSuit to be m, p, or s`);
    }
    return;
  }
  if (lackSuit !== null) {
    throw new Error(`ruleset ${ruleset.id} requires lackSuit to be null`);
  }
}

function suitLabel(suit) {
  const label = SUIT_LABELS[suit];
  if (label === undefined) {
    throw new Error(`Unknown suited Mahjong suit: ${suit}`);
  }
  return label;
}

function allowedTileIds(ruleset) {
  assertRuleset(ruleset);
  return Object.keys(ruleset.tileCounts).sort((left, right) => TILE_ORDER[left] - TILE_ORDER[right]);
}

function assertTile(tile) {
  if (!Object.prototype.hasOwnProperty.call(TILE_BY_ID, tile)) {
    throw new Error(`Unknown Mahjong tile: ${tile}`);
  }
}

function assertTileAllowed(tile, ruleset) {
  assertTile(tile);
  if (!Object.prototype.hasOwnProperty.call(ruleset.tileCounts, tile)) {
    throw new Error(`Tile ${tile} is not allowed by ruleset ${ruleset.id}`);
  }
}

function normalizeHand(hand, ruleset) {
  assertRuleset(ruleset);
  if (!Array.isArray(hand)) {
    throw new Error("hand must be an array");
  }
  for (const tile of hand) {
    assertTileAllowed(tile, ruleset);
  }
  return sortTiles(hand);
}

function sortTiles(hand) {
  return [...hand].sort((left, right) => TILE_ORDER[left] - TILE_ORDER[right]);
}

function tileLabel(tile) {
  assertTile(tile);
  return TILE_BY_ID[tile].label;
}

function countTiles(tiles, ruleset) {
  assertRuleset(ruleset);
  const counts = Object.fromEntries(allowedTileIds(ruleset).map((tile) => [tile, 0]));
  for (const tile of tiles) {
    assertTileAllowed(tile, ruleset);
    counts[tile] += 1;
  }
  return counts;
}

function removeOneTile(hand, tile, ruleset) {
  assertTileAllowed(tile, ruleset);
  const next = [...hand];
  const index = next.indexOf(tile);
  if (index === -1) {
    throw new Error(`Cannot remove missing tile: ${tile}`);
  }
  next.splice(index, 1);
  return next;
}

function splitWildcardCounts(hand, ruleset) {
  const counts = countTiles(hand, ruleset);
  const wildcardTile = ruleset.gameplay.wildcardTile;
  if (wildcardTile !== null) {
    assertTileAllowed(wildcardTile, ruleset);
    const wildcards = counts[wildcardTile];
    counts[wildcardTile] = 0;
    return { counts, wildcards };
  }
  return { counts, wildcards: 0 };
}

function suitedSuitsInHand(hand, ruleset) {
  const wildcardTile = ruleset.gameplay.wildcardTile;
  const suits = new Set();
  for (const tile of hand) {
    if (tile === wildcardTile) {
      continue;
    }
    const def = TILE_BY_ID[tile];
    if (def.suit !== "z") {
      suits.add(def.suit);
    }
  }
  return suits;
}

function lacksOneSuit(hand, ruleset) {
  return suitedSuitsInHand(hand, ruleset).size <= 2;
}

function countSuitTiles(hand, suit, ruleset) {
  if (!SUITED_SUITS.includes(suit)) {
    throw new Error(`suit must be m, p, or s: ${suit}`);
  }
  const normalized = normalizeHand(hand, ruleset);
  return normalized.filter((tile) => TILE_BY_ID[tile].suit === suit).length;
}

function hasDingqueTiles(hand, ruleset, lackSuit) {
  assertLackSuit(lackSuit, ruleset);
  if (!ruleset.gameplay.requiresDingque) {
    return false;
  }
  return hand.some((tile) => TILE_BY_ID[tile].suit === lackSuit);
}

function legalDiscardTiles(hand, ruleset, lackSuit) {
  const normalized = normalizeHand(hand, ruleset);
  assertLackSuit(lackSuit, ruleset);
  const uniqueTiles = [...new Set(normalized)];
  if (!ruleset.gameplay.mustDiscardDingqueFirst || !hasDingqueTiles(normalized, ruleset, lackSuit)) {
    return uniqueTiles;
  }
  return uniqueTiles.filter((tile) => TILE_BY_ID[tile].suit === lackSuit);
}

function canFormSevenPairs(hand, ruleset) {
  const normalized = normalizeHand(hand, ruleset);
  if (normalized.length !== 14) {
    return false;
  }
  const { counts, wildcards } = splitWildcardCounts(normalized, ruleset);
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

function firstCountedTile(counts, ruleset) {
  return allowedTileIds(ruleset).find((tile) => counts[tile] > 0);
}

function canFormMelds(counts, wildcards, ruleset) {
  const tile = firstCountedTile(counts, ruleset);
  if (tile === undefined) {
    return wildcards % 3 === 0;
  }

  const tripletActual = Math.min(counts[tile], 3);
  const tripletNeed = 3 - tripletActual;
  if (tripletNeed <= wildcards) {
    counts[tile] -= tripletActual;
    if (canFormMelds(counts, wildcards - tripletNeed, ruleset)) {
      counts[tile] += tripletActual;
      return true;
    }
    counts[tile] += tripletActual;
  }

  const def = TILE_BY_ID[tile];
  if (def.suit !== "z" && def.rank <= 7) {
    const second = `${def.suit}${def.rank + 1}`;
    const third = `${def.suit}${def.rank + 2}`;
    if (Object.prototype.hasOwnProperty.call(counts, second) && Object.prototype.hasOwnProperty.call(counts, third)) {
      const secondActual = counts[second] > 0 ? 1 : 0;
      const thirdActual = counts[third] > 0 ? 1 : 0;
      const sequenceNeed = 2 - secondActual - thirdActual;
      if (sequenceNeed <= wildcards) {
        counts[tile] -= 1;
        counts[second] -= secondActual;
        counts[third] -= thirdActual;
        if (canFormMelds(counts, wildcards - sequenceNeed, ruleset)) {
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

  return false;
}

function canFormTripletMelds(counts, wildcards, ruleset) {
  const tile = firstCountedTile(counts, ruleset);
  if (tile === undefined) {
    return wildcards % 3 === 0;
  }
  const actual = Math.min(counts[tile], 3);
  const need = 3 - actual;
  if (need > wildcards) {
    return false;
  }
  counts[tile] -= actual;
  const matched = canFormTripletMelds(counts, wildcards - need, ruleset);
  counts[tile] += actual;
  return matched;
}

function isAllTriplets(hand, ruleset) {
  const normalized = normalizeHand(hand, ruleset);
  if (normalized.length % 3 !== 2) {
    return false;
  }
  const { counts, wildcards } = splitWildcardCounts(normalized, ruleset);
  for (const tile of allowedTileIds(ruleset)) {
    if (tile === ruleset.gameplay.wildcardTile) {
      continue;
    }
    const actual = Math.min(counts[tile], 2);
    const need = 2 - actual;
    if (need <= wildcards) {
      counts[tile] -= actual;
      if (canFormTripletMelds(counts, wildcards - need, ruleset)) {
        counts[tile] += actual;
        return true;
      }
      counts[tile] += actual;
    }
  }
  if (wildcards >= 2) {
    return canFormTripletMelds(counts, wildcards - 2, ruleset);
  }
  return false;
}

function isPureSuit(hand, ruleset) {
  const wildcardTile = ruleset.gameplay.wildcardTile;
  const suits = new Set();
  for (const tile of hand) {
    if (tile === wildcardTile) {
      continue;
    }
    const def = TILE_BY_ID[tile];
    if (def.suit === "z") {
      return false;
    }
    suits.add(def.suit);
  }
  return suits.size === 1;
}

function isWinningHand(hand, ruleset, lackSuit) {
  const normalized = normalizeHand(hand, ruleset);
  assertLackSuit(lackSuit, ruleset);
  if (normalized.length % 3 !== 2) {
    return false;
  }
  if (ruleset.gameplay.requiresDingque && hasDingqueTiles(normalized, ruleset, lackSuit)) {
    return false;
  }
  if (canFormSevenPairs(normalized, ruleset)) {
    return true;
  }

  const { counts, wildcards } = splitWildcardCounts(normalized, ruleset);
  for (const tile of allowedTileIds(ruleset)) {
    if (tile === ruleset.gameplay.wildcardTile) {
      continue;
    }
    const actual = Math.min(counts[tile], 2);
    const need = 2 - actual;
    if (need <= wildcards) {
      counts[tile] -= actual;
      if (canFormMelds(counts, wildcards - need, ruleset)) {
        counts[tile] += actual;
        return true;
      }
      counts[tile] += actual;
    }
  }
  if (wildcards >= 2) {
    return canFormMelds(counts, wildcards - 2, ruleset);
  }
  return false;
}

function availableTileCount(tile, hand, visibleTiles, ruleset) {
  assertTileAllowed(tile, ruleset);
  const counts = countTiles([...hand, ...visibleTiles], ruleset);
  return ruleset.tileCounts[tile] - counts[tile];
}

function winningTiles(hand, visibleTiles, ruleset, lackSuit) {
  const normalized = normalizeHand(hand, ruleset);
  const visible = normalizeHand(visibleTiles, ruleset);
  assertLackSuit(lackSuit, ruleset);
  if (normalized.length % 3 !== 1) {
    throw new Error("winningTiles requires a 3n+1 tile hand");
  }

  const wins = [];
  for (const tile of allowedTileIds(ruleset)) {
    const remaining = availableTileCount(tile, normalized, visible, ruleset);
    if (remaining > 0 && isWinningHand([...normalized, tile], ruleset, lackSuit)) {
      wins.push({ tile, label: tileLabel(tile), remaining });
    }
  }
  return wins;
}

function structuralShapeScore(hand, ruleset) {
  const normalized = normalizeHand(hand, ruleset);
  const counts = countTiles(normalized, ruleset);
  let score = 0;

  for (const tile of allowedTileIds(ruleset)) {
    if (counts[tile] >= 2) {
      score += 18;
    }
    if (counts[tile] >= 3) {
      score += 35;
    }
  }

  for (const tile of allowedTileIds(ruleset)) {
    const def = TILE_BY_ID[tile];
    if (tile === ruleset.gameplay.wildcardTile) {
      score += counts[tile] * 20;
      continue;
    }
    if (def.suit === "z") {
      if (counts[tile] === 1) {
        score -= 6;
      }
      continue;
    }

    const next = `${def.suit}${def.rank + 1}`;
    const gap = `${def.suit}${def.rank + 2}`;
    if (def.rank <= 8 && counts[tile] > 0 && counts[next] > 0) {
      score += 13;
    }
    if (def.rank <= 7 && counts[tile] > 0 && counts[gap] > 0) {
      score += 7;
    }
    if ((def.rank === 1 || def.rank === 9) && counts[tile] === 1) {
      score -= 3;
    }
  }

  return score;
}

function shapeScore(hand, ruleset, lackSuit) {
  const normalized = normalizeHand(hand, ruleset);
  assertLackSuit(lackSuit, ruleset);
  const structure = structuralShapeScore(normalized, ruleset);
  if (!ruleset.gameplay.requiresDingque) {
    return structure;
  }
  return structure - countSuitTiles(normalized, lackSuit, ruleset) * 120;
}

function chooseLackSuit(hand, ruleset) {
  const normalized = normalizeHand(hand, ruleset);
  if (!ruleset.gameplay.requiresDingque) {
    throw new Error(`ruleset ${ruleset.id} does not use dingque`);
  }
  if (normalized.length !== ruleset.gameplay.initialHandSize && normalized.length !== ruleset.gameplay.dealerDraws) {
    throw new Error("dingque recommendation requires an initial 13-tile or dealer 14-tile hand");
  }

  const ranked = SUITED_SUITS.map((suit) => {
    const tileCount = countSuitTiles(normalized, suit, ruleset);
    const remainingHand = normalized.filter((tile) => TILE_BY_ID[tile].suit !== suit);
    const remainingShapeScore = structuralShapeScore(remainingHand, ruleset);
    return {
      suit,
      label: suitLabel(suit),
      tileCount,
      remainingShapeScore
    };
  }).sort((left, right) => {
    if (left.tileCount !== right.tileCount) {
      return left.tileCount - right.tileCount;
    }
    if (right.remainingShapeScore !== left.remainingShapeScore) {
      return right.remainingShapeScore - left.remainingShapeScore;
    }
    return SUITED_SUITS.indexOf(left.suit) - SUITED_SUITS.indexOf(right.suit);
  });

  const best = ranked[0];
  return {
    lackSuit: best.suit,
    lackSuitLabel: best.label,
    reason: `建议定缺${best.label}：该花色 ${best.tileCount} 张，保留另外两门的结构分 ${best.remainingShapeScore}。`,
    ranked
  };
}

function readyAfterDiscards(hand, visibleTiles, ruleset, lackSuit) {
  const normalized = normalizeHand(hand, ruleset);
  const visible = normalizeHand(visibleTiles, ruleset);
  assertLackSuit(lackSuit, ruleset);
  if (normalized.length % 3 !== 2) {
    throw new Error("readyAfterDiscards requires a 3n+2 tile hand");
  }

  const options = [];
  for (const tile of legalDiscardTiles(normalized, ruleset, lackSuit)) {
    const afterDiscard = removeOneTile(normalized, tile, ruleset);
    const waits = winningTiles(afterDiscard, visible, ruleset, lackSuit);
    options.push({
      discard: tile,
      discardLabel: tileLabel(tile),
      waits,
      waitCount: waits.reduce((total, wait) => total + wait.remaining, 0)
    });
  }

  return options
    .filter((option) => option.waits.length > 0)
    .sort((left, right) => {
      if (right.waitCount !== left.waitCount) {
        return right.waitCount - left.waitCount;
      }
      return TILE_ORDER[left.discard] - TILE_ORDER[right.discard];
    });
}

function estimateShanten(hand, visibleTiles, ruleset, lackSuit) {
  const normalized = normalizeHand(hand, ruleset);
  assertLackSuit(lackSuit, ruleset);
  if (normalized.length % 3 === 2 && isWinningHand(normalized, ruleset, lackSuit)) {
    return -1;
  }
  if (normalized.length % 3 === 1 && winningTiles(normalized, visibleTiles, ruleset, lackSuit).length > 0) {
    return 0;
  }
  if (normalized.length % 3 === 2 && readyAfterDiscards(normalized, visibleTiles, ruleset, lackSuit).length > 0) {
    return 0;
  }

  const score = shapeScore(normalized, ruleset, lackSuit);
  const estimate = 6 - Math.floor(score / 42);
  return Math.max(1, Math.min(6, estimate));
}

function scoreHand(hand, ruleset, lackSuit) {
  const normalized = normalizeHand(hand, ruleset);
  assertLackSuit(lackSuit, ruleset);
  const isWinning = isWinningHand(normalized, ruleset, lackSuit);
  if (!isWinning) {
    return {
      isWinning: false,
      totalFan: 0,
      cappedFan: 0,
      patterns: []
    };
  }

  const matched = [];
  for (const pattern of ruleset.scoring.patterns) {
    const result = matchPattern(pattern, normalized, ruleset);
    if (result.matched) {
      matched.push({
        id: pattern.id,
        name: pattern.name,
        fan: result.fan,
        type: pattern.type
      });
    }
  }

  const appliedPatterns = ruleset.scoring.aggregation === "highest"
    ? matched.filter((pattern) => pattern.fan === Math.max(...matched.map((item) => item.fan))).slice(0, 1)
    : matched;
  const totalFan = appliedPatterns.reduce((total, pattern) => total + pattern.fan, 0);
  return {
    isWinning: true,
    totalFan,
    cappedFan: Math.min(totalFan, ruleset.scoring.maxFan),
    patterns: appliedPatterns
  };
}

function matchPattern(pattern, hand, ruleset) {
  if (pattern.type === "base") {
    return { matched: true, fan: pattern.fan };
  }
  if (pattern.type === "allTriplets") {
    return { matched: isAllTriplets(hand, ruleset), fan: pattern.fan };
  }
  if (pattern.type === "pureSuit") {
    return { matched: isPureSuit(hand, ruleset), fan: pattern.fan };
  }
  if (pattern.type === "sevenPairs") {
    return { matched: canFormSevenPairs(hand, ruleset), fan: pattern.fan };
  }
  if (pattern.type === "pureSevenPairs") {
    return { matched: canFormSevenPairs(hand, ruleset) && isPureSuit(hand, ruleset), fan: pattern.fan };
  }
  if (pattern.type === "lacksOneSuit") {
    return { matched: lacksOneSuit(hand, ruleset), fan: pattern.fan };
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

function analyzeHand(payload, ruleset) {
  if (payload === null || typeof payload !== "object") {
    throw new Error("payload must be an object");
  }
  const hand = normalizeHand(payload.hand, ruleset);
  if (!Array.isArray(payload.visibleTiles)) {
    throw new Error("visibleTiles must be an array");
  }
  if (!Object.prototype.hasOwnProperty.call(payload, "lackSuit")) {
    throw new Error("lackSuit is required");
  }
  const lackSuit = payload.lackSuit;
  assertLackSuit(lackSuit, ruleset);
  const visibleTiles = normalizeHand(payload.visibleTiles, ruleset);
  if (hand.length < 1 || hand.length > 14) {
    throw new Error("hand length must be between 1 and 14");
  }

  const analysis = {
    rulesetId: ruleset.id,
    hand,
    labels: hand.map(tileLabel),
    tileCount: hand.length,
    lackSuit,
    lackSuitLabel: lackSuit === null ? null : suitLabel(lackSuit),
    lackSuitRemaining: lackSuit === null ? 0 : countSuitTiles(hand, lackSuit, ruleset),
    legalDiscards: hand.length % 3 === 2 ? legalDiscardTiles(hand, ruleset, lackSuit) : [],
    shapeScore: shapeScore(hand, ruleset, lackSuit),
    estimatedShanten: estimateShanten(hand, visibleTiles, ruleset, lackSuit),
    isWinning: hand.length % 3 === 2 ? isWinningHand(hand, ruleset, lackSuit) : false,
    waits: [],
    readyDiscards: [],
    score: scoreHand(hand, ruleset, lackSuit)
  };

  if (hand.length % 3 === 1) {
    analysis.waits = winningTiles(hand, visibleTiles, ruleset, lackSuit);
  }
  if (hand.length % 3 === 2) {
    analysis.readyDiscards = readyAfterDiscards(hand, visibleTiles, ruleset, lackSuit);
  }
  return analysis;
}

module.exports = {
  TILE_DEFS,
  TILE_IDS,
  TILE_BY_ID,
  TILE_ORDER,
  SUITED_SUITS,
  assertTile,
  assertLackSuit,
  normalizeHand,
  sortTiles,
  tileLabel,
  suitLabel,
  countTiles,
  countSuitTiles,
  removeOneTile,
  hasDingqueTiles,
  legalDiscardTiles,
  chooseLackSuit,
  isWinningHand,
  winningTiles,
  readyAfterDiscards,
  estimateShanten,
  shapeScore,
  analyzeHand,
  scoreHand,
  canFormSevenPairs,
  isAllTriplets,
  isPureSuit,
  lacksOneSuit
};
