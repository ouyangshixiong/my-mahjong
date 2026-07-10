const {
  TILE_ORDER,
  analyzeHand,
  assertLackSuit,
  hasDingqueTiles,
  legalDiscardTiles,
  normalizeHand,
  removeOneTile,
  shapeScore,
  suitLabel,
  tileLabel,
  winningTiles,
  isWinningHand
} = require("./mahjong");
const { getRuleset } = require("./rulesets");

function assertStrategyPayload(payload) {
  if (payload === null || typeof payload !== "object") {
    throw new Error("payload must be an object");
  }
  if (!Array.isArray(payload.hand)) {
    throw new Error("hand must be an array");
  }
  if (!Array.isArray(payload.visibleTiles)) {
    throw new Error("visibleTiles must be an array");
  }
  if (typeof payload.rulesetId !== "string" || payload.rulesetId.length === 0) {
    throw new Error("rulesetId must be a non-empty string");
  }
  if (!Object.prototype.hasOwnProperty.call(payload, "lackSuit")) {
    throw new Error("lackSuit is required");
  }
  if (typeof payload.mustDiscard !== "boolean") {
    throw new Error("mustDiscard must be boolean");
  }
}

function recommendDiscard(payload) {
  assertStrategyPayload(payload);
  const ruleset = getRuleset(payload.rulesetId);
  const lackSuit = payload.lackSuit;
  assertLackSuit(lackSuit, ruleset);
  const hand = normalizeHand(payload.hand, ruleset);
  const visibleTiles = normalizeHand(payload.visibleTiles, ruleset);
  if (hand.length % 3 !== 2) {
    throw new Error("discard recommendation requires a 3n+2 tile hand");
  }

  const analysis = analyzeHand({ hand, visibleTiles, lackSuit }, ruleset);
  if (isWinningHand(hand, ruleset, lackSuit) && !payload.mustDiscard) {
    return {
      action: "hu",
      discard: null,
      discardLabel: null,
      reason: "当前手牌已经满足胡牌结构。",
      ranked: [],
      analysis
    };
  }

  const ranked = legalDiscardTiles(hand, ruleset, lackSuit).map((tile) => {
    const afterDiscard = removeOneTile(hand, tile, ruleset);
    const waits = winningTiles(afterDiscard, visibleTiles, ruleset, lackSuit);
    const liveWaits = waits.reduce((total, wait) => total + wait.remaining, 0);
    const score = shapeScore(afterDiscard, ruleset, lackSuit) + waits.length * 80 + liveWaits * 35;
    return {
      discard: tile,
      discardLabel: tileLabel(tile),
      score,
      waits,
      liveWaits,
      reason: buildReason(tile, waits, liveWaits, afterDiscard, ruleset, lackSuit)
    };
  }).sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    return TILE_ORDER[left.discard] - TILE_ORDER[right.discard];
  });

  const best = ranked[0];
  if (best === undefined) {
    throw new Error("no discard candidate found");
  }

  return {
    action: "discard",
    discard: best.discard,
    discardLabel: best.discardLabel,
    reason: best.reason,
    ranked,
    analysis
  };
}

function buildReason(tile, waits, liveWaits, afterDiscard, ruleset, lackSuit) {
  if (ruleset.gameplay.requiresDingque && hasDingqueTiles(afterDiscard, ruleset, lackSuit)) {
    return `已定缺${suitLabel(lackSuit)}，必须继续优先打缺门牌。`;
  }
  if (ruleset.gameplay.requiresDingque && tile.startsWith(lackSuit) && !hasDingqueTiles(afterDiscard, ruleset, lackSuit)) {
    return `打${tileLabel(tile)}后清空定缺${suitLabel(lackSuit)}，随后可按牌型自由出牌。`;
  }
  const waitLabels = waits.map((wait) => `${wait.label}x${wait.remaining}`);
  if (waitLabels.length > 0) {
    return `打${tileLabel(tile)}后进入听牌，活张 ${liveWaits}，听 ${waitLabels.join("、")}。`;
  }
  const score = shapeScore(afterDiscard, ruleset, lackSuit);
  return `打${tileLabel(tile)}后保留搭子结构，形状分 ${score}。`;
}

module.exports = {
  recommendDiscard
};
