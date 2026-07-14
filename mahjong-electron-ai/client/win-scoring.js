const SPECIAL_SELF_DRAW_CONTEXTS = Object.freeze(["gangShangHua", "haiDi"]);

function winContextAfterDiscard(drawWinContext) {
  if (![null, "gangShangHua", "haiDi"].includes(drawWinContext)) {
    throw new Error(`Invalid draw win context before discard: ${drawWinContext}`);
  }
  return drawWinContext === "gangShangHua" ? "gangShangPao" : null;
}

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

function declaredGangPatternForWin(melds) {
  if (!Array.isArray(melds)) {
    throw new Error("melds must be an array");
  }
  const gangCount = melds.filter((meld) => meld.type === "gang").length;
  if (gangCount === 0) {
    return null;
  }
  return Object.freeze({
    id: "gang",
    name: `杠x${gangCount}`,
    fan: gangCount,
    type: "gangEach"
  });
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
  if (winContext === "haiDi" && settlementType !== "selfDraw") {
    throw new Error("haiDi win context requires a self-draw settlement");
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

function validateWinPatterns(patterns) {
  if (!Array.isArray(patterns) || patterns.length === 0) {
    throw new Error("win patterns must be a non-empty array");
  }
  for (const pattern of patterns) {
    if (
      pattern === null
      || typeof pattern !== "object"
      || typeof pattern.id !== "string"
      || pattern.id.length === 0
      || typeof pattern.name !== "string"
      || pattern.name.length === 0
      || !Number.isInteger(pattern.fan)
      || pattern.fan < 0
    ) {
      throw new Error("win pattern must contain a valid id, name, and fan");
    }
  }
}

function announcementPatternsForWin(patterns) {
  validateWinPatterns(patterns);
  const specialPatterns = patterns.filter(
    (pattern) => pattern.id !== "baseHu" && pattern.id !== "selfDraw"
  );
  if (specialPatterns.length > 0) {
    return specialPatterns;
  }
  const selfDrawPatterns = patterns.filter((pattern) => pattern.id === "selfDraw");
  if (selfDrawPatterns.length > 0) {
    return selfDrawPatterns;
  }
  const basePatterns = patterns.filter((pattern) => pattern.id === "baseHu");
  if (basePatterns.length === 0) {
    throw new Error("win patterns do not contain an announceable pattern");
  }
  return basePatterns;
}

function multipleWinnerAnnouncementForCount(winnerCount) {
  if (!Number.isInteger(winnerCount) || winnerCount < 1 || winnerCount > 3) {
    throw new Error("discard winner count must be an integer from 1 to 3");
  }
  if (winnerCount === 1) {
    return null;
  }
  return winnerCount === 2 ? "一炮双响" : "一炮三响";
}

function displayPatternNamesForWin(patterns) {
  validateWinPatterns(patterns);
  const specialPatterns = patterns.filter(
    (pattern) => pattern.id !== "baseHu" && pattern.id !== "selfDraw"
  );
  const displayPatterns = specialPatterns.length > 0
    ? specialPatterns
    : patterns.filter((pattern) => pattern.id === "baseHu");
  if (displayPatterns.length === 0) {
    throw new Error("win patterns do not contain a displayable pattern");
  }
  return displayPatterns
    .map((pattern, index) => ({ pattern, index }))
    .sort((left, right) => right.pattern.fan - left.pattern.fan || left.index - right.index)
    .map(({ pattern }) => pattern.name);
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
  announcementPatternsForWin,
  declaredGangPatternForWin,
  displayPatternNamesForWin,
  multipleWinnerAnnouncementForCount,
  operationPatternForWin,
  rootCountForWin,
  scoreAmount,
  winContextAfterDiscard
};
