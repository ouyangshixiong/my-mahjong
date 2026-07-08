const {
  TILE_ORDER,
  analyzeHand,
  normalizeHand,
  removeOneTile,
  shapeScore,
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
}

function recommendDiscard(payload) {
  assertStrategyPayload(payload);
  const ruleset = getRuleset(payload.rulesetId);
  const hand = normalizeHand(payload.hand, ruleset);
  const visibleTiles = normalizeHand(payload.visibleTiles, ruleset);
  if (hand.length % 3 !== 2) {
    throw new Error("discard recommendation requires a 3n+2 tile hand");
  }

  const analysis = analyzeHand({ hand, visibleTiles }, ruleset);
  if (isWinningHand(hand, ruleset)) {
    return {
      action: "hu",
      discard: null,
      discardLabel: null,
      reason: "当前手牌已经满足胡牌结构。",
      ranked: [],
      analysis
    };
  }

  const ranked = [...new Set(hand)].map((tile) => {
    const afterDiscard = removeOneTile(hand, tile, ruleset);
    const waits = winningTiles(afterDiscard, visibleTiles, ruleset);
    const liveWaits = waits.reduce((total, wait) => total + wait.remaining, 0);
    const score = shapeScore(afterDiscard, ruleset) + waits.length * 80 + liveWaits * 35;
    return {
      discard: tile,
      discardLabel: tileLabel(tile),
      score,
      waits,
      liveWaits,
      reason: buildReason(tile, waits, liveWaits, afterDiscard, ruleset)
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

function buildReason(tile, waits, liveWaits, afterDiscard, ruleset) {
  const waitLabels = waits.map((wait) => `${wait.label}x${wait.remaining}`);
  if (waitLabels.length > 0) {
    return `打${tileLabel(tile)}后进入听牌，活张 ${liveWaits}，听 ${waitLabels.join("、")}。`;
  }
  const score = shapeScore(afterDiscard, ruleset);
  return `打${tileLabel(tile)}后保留搭子结构，形状分 ${score}。`;
}

module.exports = {
  recommendDiscard
};
