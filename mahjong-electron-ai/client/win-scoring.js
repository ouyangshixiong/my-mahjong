const SPECIAL_SELF_DRAW_CONTEXTS = Object.freeze(["gangShangHua", "haiDi"]);

function rootCountForWin(hand, melds) {
  if (!Array.isArray(hand) || !Array.isArray(melds)) {
    throw new Error("hand and melds must be arrays");
  }
  const tiles = [
    ...hand,
    ...melds
      .filter((meld) => meld.type !== "gang")
      .flatMap((meld) => meld.tiles)
  ];
  const counts = new Map();
  for (const tile of tiles) {
    counts.set(tile, (counts.get(tile) ?? 0) + 1);
  }
  return [...counts.values()].filter((count) => count === 4).length;
}

function operationPatternForWin(settlementType, winContext, scoring) {
  if (settlementType !== "selfDraw" && settlementType !== "discard") {
    throw new Error(`Unknown settlement type: ${settlementType}`);
  }
  if (!Number.isInteger(scoring.selfDrawFan) || scoring.selfDrawFan < 0) {
    throw new Error("scoring.selfDrawFan must be a non-negative integer");
  }
  if (scoring.specialSelfDrawMode !== "replace" && scoring.specialSelfDrawMode !== "stack") {
    throw new Error("scoring.specialSelfDrawMode must be replace or stack");
  }
  if (settlementType === "discard" || scoring.selfDrawFan === 0) {
    return null;
  }
  if (
    winContext !== null
    && !SPECIAL_SELF_DRAW_CONTEXTS.includes(winContext)
  ) {
    throw new Error(`Invalid self-draw win context: ${winContext}`);
  }
  if (winContext !== null && scoring.specialSelfDrawMode === "replace") {
    return null;
  }
  return Object.freeze({
    id: "selfDraw",
    name: "自摸",
    fan: scoring.selfDrawFan,
    type: "winOperation"
  });
}

function scoreAmount(scoring, cappedFan) {
  if (!Number.isInteger(scoring.basePoints) || scoring.basePoints <= 0) {
    throw new Error("scoring.basePoints must be a positive integer");
  }
  if (!Number.isInteger(cappedFan) || cappedFan < 0) {
    throw new Error("cappedFan must be a non-negative integer");
  }
  return scoring.basePoints * (2 ** cappedFan);
}

module.exports = {
  operationPatternForWin,
  rootCountForWin,
  scoreAmount
};
