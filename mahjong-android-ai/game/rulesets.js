const { TILE_DEFS } = require("./mahjong");

const SUITED_TILE_IDS = Object.freeze([
  "m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9",
  "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9",
  "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"
]);

function tileCounts(tileIds) {
  return Object.fromEntries(tileIds.map((tile) => [tile, 4]));
}

const SICHUAN_SCORING_PATTERNS = Object.freeze([
  Object.freeze({ id: "baseHu", name: "平胡", fan: 0, type: "base" }),
  Object.freeze({ id: "duiDuiHu", name: "对对胡", fan: 1, type: "allTriplets" }),
  Object.freeze({ id: "yaoJiu", name: "幺九", fan: 1, type: "terminalInEveryGroup" }),
  Object.freeze({ id: "duanYaoJiu", name: "断幺九", fan: 1, type: "allSimples" }),
  Object.freeze({ id: "qingYiSe", name: "清一色", fan: 2, type: "pureSuit" }),
  Object.freeze({ id: "qiDui", name: "七对", fan: 2, type: "sevenPairs" })
]);

const DEFAULT_RULESET_ID = "sichuan-xueliu";

const RULESETS = Object.freeze([
  Object.freeze({
    id: "sichuan-xueliu",
    version: 6,
    updatedAt: "2026-07-17T00:00:00+08:00",
    name: "四川麻将血流成河",
    description: "三门 108 张，先定缺再换三张；胡牌后不退出，可重复胡牌并即时结算，直到牌墙摸完。",
    tileCounts: Object.freeze(tileCounts(SUITED_TILE_IDS)),
    gameplay: Object.freeze({
      initialHandSize: 13,
      dealerDraws: 14,
      continueAfterWin: true,
      maxWinners: 0,
      winnerExitsAfterWin: false,
      allowRepeatWins: true,
      roundEndMode: "wallEmpty",
      requiresExchangeThree: true,
      dingqueBeforeExchange: true,
      exchangeUsesDingqueSuit: true,
      exchangeTileCount: 3,
      exchangeSameSuit: true,
      exchangeAllowMixedFillWhenInsufficient: true,
      requiresDingque: true,
      mustDiscardDingqueFirst: true,
      allowChi: false,
      allowPeng: true,
      allowPengAfterWin: false,
      allowGang: true,
      allowRobGang: true,
      allowDiscardWin: true,
      allowMultipleWinnersOnDiscard: true,
      forceWinOnLastFourTiles: true,
      settleGangImmediately: true,
      refundGangOnDrawNotReady: true,
      gangPaoTransferMode: "refund",
      settleFlowerPigOnDraw: true,
      settleReadyHandsOnDraw: true,
      drawSettlementPlayerScope: "nonWinners",
      wildcardTile: null,
      honorTilesEnabled: false,
      redCenterEnabled: false
    }),
    scoring: Object.freeze({
      aggregation: "sum",
      basePoints: 100,
      baseFan: 0,
      maxFan: 5,
      selfDrawFan: 1,
      specialSelfDrawMode: "replace",
      patterns: SICHUAN_SCORING_PATTERNS
    })
  }),
  Object.freeze({
    id: "sichuan-xuezhan",
    version: 11,
    updatedAt: "2026-07-17T00:00:00+08:00",
    name: "四川麻将血战",
    description: "三门 108 张，发牌后先定缺再换三张；须换出定缺花色，该花色不足三张时用其他牌补足；不可吃，可碰杠、一炮多响。",
    tileCounts: Object.freeze(tileCounts(SUITED_TILE_IDS)),
    gameplay: Object.freeze({
      initialHandSize: 13,
      dealerDraws: 14,
      continueAfterWin: true,
      maxWinners: 3,
      winnerExitsAfterWin: true,
      allowRepeatWins: false,
      roundEndMode: "winnerLimitOrWallEmpty",
      requiresExchangeThree: true,
      dingqueBeforeExchange: true,
      exchangeUsesDingqueSuit: true,
      exchangeTileCount: 3,
      exchangeSameSuit: true,
      exchangeAllowMixedFillWhenInsufficient: true,
      requiresDingque: true,
      mustDiscardDingqueFirst: true,
      allowChi: false,
      allowPeng: true,
      allowPengAfterWin: false,
      allowGang: true,
      allowRobGang: true,
      allowDiscardWin: true,
      allowMultipleWinnersOnDiscard: true,
      forceWinOnLastFourTiles: true,
      settleGangImmediately: true,
      refundGangOnDrawNotReady: true,
      gangPaoTransferMode: "refund",
      settleFlowerPigOnDraw: true,
      settleReadyHandsOnDraw: true,
      drawSettlementPlayerScope: "nonWinners",
      wildcardTile: null,
      honorTilesEnabled: false,
      redCenterEnabled: false
    }),
    scoring: Object.freeze({
      aggregation: "sum",
      basePoints: 100,
      baseFan: 0,
      maxFan: 5,
      selfDrawFan: 1,
      specialSelfDrawMode: "replace",
      patterns: SICHUAN_SCORING_PATTERNS
    })
  }),
  Object.freeze({
    id: "hongzhong",
    version: 4,
    updatedAt: "2026-07-13T00:00:00+08:00",
    name: "红中麻将",
    description: "三门加红中 112 张，红中作癞子，可补顺子、刻子、对子。",
    tileCounts: Object.freeze({
      ...tileCounts(SUITED_TILE_IDS),
      z5: 4
    }),
    gameplay: Object.freeze({
      initialHandSize: 13,
      dealerDraws: 14,
      continueAfterWin: false,
      maxWinners: 1,
      winnerExitsAfterWin: true,
      allowRepeatWins: false,
      roundEndMode: "winnerLimitOrWallEmpty",
      requiresExchangeThree: false,
      dingqueBeforeExchange: false,
      exchangeUsesDingqueSuit: false,
      exchangeTileCount: 0,
      exchangeSameSuit: false,
      exchangeAllowMixedFillWhenInsufficient: false,
      requiresDingque: false,
      mustDiscardDingqueFirst: false,
      allowChi: false,
      allowPeng: false,
      allowPengAfterWin: false,
      allowGang: false,
      allowRobGang: false,
      allowDiscardWin: true,
      allowMultipleWinnersOnDiscard: false,
      forceWinOnLastFourTiles: false,
      settleGangImmediately: false,
      refundGangOnDrawNotReady: false,
      gangPaoTransferMode: "none",
      settleFlowerPigOnDraw: false,
      settleReadyHandsOnDraw: false,
      drawSettlementPlayerScope: "none",
      wildcardTile: "z5",
      honorTilesEnabled: false,
      redCenterEnabled: true
    }),
    scoring: Object.freeze({
      aggregation: "sum",
      basePoints: 100,
      baseFan: 1,
      maxFan: 24,
      selfDrawFan: 0,
      specialSelfDrawMode: "replace",
      patterns: Object.freeze([
        Object.freeze({ id: "baseHu", name: "基础胡", fan: 1, type: "base" }),
        Object.freeze({ id: "duiDuiHu", name: "碰碰胡", fan: 2, type: "allTriplets" }),
        Object.freeze({ id: "qingYiSe", name: "清一色", fan: 4, type: "pureSuit" }),
        Object.freeze({ id: "qiDui", name: "七对", fan: 4, type: "sevenPairs" }),
        Object.freeze({ id: "hongZhong", name: "红中", fan: 1, type: "wildcardEach" })
      ])
    })
  })
]);

const RULESETS_BY_ID = Object.freeze(Object.fromEntries(RULESETS.map((ruleset) => [ruleset.id, ruleset])));

function assertRulesetShape(ruleset) {
  if (ruleset === null || typeof ruleset !== "object") {
    throw new Error("ruleset must be an object");
  }
  for (const field of ["id", "version", "updatedAt", "name", "description", "tileCounts", "gameplay", "scoring"]) {
    if (!Object.prototype.hasOwnProperty.call(ruleset, field)) {
      throw new Error(`ruleset missing field: ${field}`);
    }
  }
  for (const [tile, count] of Object.entries(ruleset.tileCounts)) {
    if (!TILE_DEFS.some((definition) => definition.id === tile)) {
      throw new Error(`ruleset ${ruleset.id} contains unknown tile ${tile}`);
    }
    if (count !== 4) {
      throw new Error(`ruleset ${ruleset.id} tile ${tile} must have count 4`);
    }
  }
  for (const field of [
    "initialHandSize",
    "dealerDraws",
    "continueAfterWin",
    "maxWinners",
    "winnerExitsAfterWin",
    "allowRepeatWins",
    "roundEndMode",
    "requiresExchangeThree",
    "dingqueBeforeExchange",
    "exchangeUsesDingqueSuit",
    "exchangeTileCount",
    "exchangeSameSuit",
    "exchangeAllowMixedFillWhenInsufficient",
    "requiresDingque",
    "mustDiscardDingqueFirst",
    "allowChi",
    "allowPeng",
    "allowPengAfterWin",
    "allowGang",
    "allowRobGang",
    "allowDiscardWin",
    "allowMultipleWinnersOnDiscard",
    "forceWinOnLastFourTiles",
    "settleGangImmediately",
    "refundGangOnDrawNotReady",
    "gangPaoTransferMode",
    "settleFlowerPigOnDraw",
    "settleReadyHandsOnDraw",
    "drawSettlementPlayerScope",
    "honorTilesEnabled",
    "redCenterEnabled"
  ]) {
    if (!Object.prototype.hasOwnProperty.call(ruleset.gameplay, field)) {
      throw new Error(`ruleset ${ruleset.id} gameplay missing field: ${field}`);
    }
  }
  for (const field of [
    "continueAfterWin",
    "winnerExitsAfterWin",
    "allowRepeatWins",
    "requiresExchangeThree",
    "dingqueBeforeExchange",
    "exchangeUsesDingqueSuit",
    "exchangeSameSuit",
    "exchangeAllowMixedFillWhenInsufficient",
    "requiresDingque",
    "mustDiscardDingqueFirst",
    "allowChi",
    "allowPeng",
    "allowPengAfterWin",
    "allowGang",
    "allowRobGang",
    "allowDiscardWin",
    "allowMultipleWinnersOnDiscard",
    "forceWinOnLastFourTiles",
    "settleGangImmediately",
    "refundGangOnDrawNotReady",
    "settleFlowerPigOnDraw",
    "settleReadyHandsOnDraw",
    "honorTilesEnabled",
    "redCenterEnabled"
  ]) {
    if (typeof ruleset.gameplay[field] !== "boolean") {
      throw new Error(`ruleset ${ruleset.id} gameplay.${field} must be boolean`);
    }
  }
  for (const field of ["initialHandSize", "dealerDraws", "maxWinners", "exchangeTileCount"]) {
    if (!Number.isInteger(ruleset.gameplay[field]) || ruleset.gameplay[field] < 0) {
      throw new Error(`ruleset ${ruleset.id} gameplay.${field} must be a non-negative integer`);
    }
  }
  if (!["winnerLimitOrWallEmpty", "wallEmpty"].includes(ruleset.gameplay.roundEndMode)) {
    throw new Error(`ruleset ${ruleset.id} gameplay.roundEndMode is invalid`);
  }
  if (!["none", "activePlayers", "nonWinners"].includes(ruleset.gameplay.drawSettlementPlayerScope)) {
    throw new Error(`ruleset ${ruleset.id} gameplay.drawSettlementPlayerScope is invalid`);
  }
  const hasDrawSettlement = ruleset.gameplay.refundGangOnDrawNotReady
    || ruleset.gameplay.settleFlowerPigOnDraw
    || ruleset.gameplay.settleReadyHandsOnDraw;
  if (hasDrawSettlement === (ruleset.gameplay.drawSettlementPlayerScope === "none")) {
    throw new Error(`ruleset ${ruleset.id} draw settlement switches conflict with its player scope`);
  }
  if (ruleset.gameplay.roundEndMode === "wallEmpty" && ruleset.gameplay.maxWinners !== 0) {
    throw new Error(`ruleset ${ruleset.id} wall-empty mode must use maxWinners 0`);
  }
  if (ruleset.gameplay.roundEndMode === "winnerLimitOrWallEmpty" && ruleset.gameplay.maxWinners < 1) {
    throw new Error(`ruleset ${ruleset.id} winner-limit mode must use a positive maxWinners`);
  }
  if (ruleset.gameplay.allowRepeatWins === ruleset.gameplay.winnerExitsAfterWin) {
    throw new Error(`ruleset ${ruleset.id} repeat-win and winner-exit settings conflict`);
  }
  if (ruleset.gameplay.requiresExchangeThree && ruleset.gameplay.exchangeTileCount !== 3) {
    throw new Error(`ruleset ${ruleset.id} exchange-three must exchange exactly 3 tiles`);
  }
  if (!ruleset.gameplay.requiresExchangeThree && ruleset.gameplay.exchangeTileCount !== 0) {
    throw new Error(`ruleset ${ruleset.id} without exchange-three must use exchangeTileCount 0`);
  }
  if (ruleset.gameplay.exchangeAllowMixedFillWhenInsufficient && !ruleset.gameplay.requiresExchangeThree) {
    throw new Error(`ruleset ${ruleset.id} cannot allow mixed exchange fill without exchange-three`);
  }
  if (
    ruleset.gameplay.dingqueBeforeExchange
    && (!ruleset.gameplay.requiresDingque || !ruleset.gameplay.requiresExchangeThree)
  ) {
    throw new Error(`ruleset ${ruleset.id} cannot put dingque before exchange without both phases`);
  }
  if (
    ruleset.gameplay.exchangeUsesDingqueSuit
    && (
      !ruleset.gameplay.requiresDingque
      || !ruleset.gameplay.requiresExchangeThree
      || !ruleset.gameplay.dingqueBeforeExchange
      || !ruleset.gameplay.exchangeSameSuit
    )
  ) {
    throw new Error(`ruleset ${ruleset.id} cannot exchange the dingque suit with its current phase settings`);
  }
  if (ruleset.gameplay.allowRobGang && !ruleset.gameplay.allowGang) {
    throw new Error(`ruleset ${ruleset.id} cannot allow rob-gang while gang is disabled`);
  }
  if (ruleset.gameplay.settleGangImmediately && !ruleset.gameplay.allowGang) {
    throw new Error(`ruleset ${ruleset.id} cannot settle gang while gang is disabled`);
  }
  if (ruleset.gameplay.refundGangOnDrawNotReady && !ruleset.gameplay.settleGangImmediately) {
    throw new Error(`ruleset ${ruleset.id} cannot refund gang without immediate gang settlement`);
  }
  if (!["none", "refund"].includes(ruleset.gameplay.gangPaoTransferMode)) {
    throw new Error(`ruleset ${ruleset.id} gameplay.gangPaoTransferMode must be none or refund`);
  }
  if (!Object.prototype.hasOwnProperty.call(ruleset.gameplay, "wildcardTile")) {
    throw new Error(`ruleset ${ruleset.id} gameplay missing field: wildcardTile`);
  }
  if (!Array.isArray(ruleset.scoring.patterns)) {
    throw new Error(`ruleset ${ruleset.id} scoring.patterns must be an array`);
  }
  if (!Number.isInteger(ruleset.scoring.basePoints) || ruleset.scoring.basePoints <= 0) {
    throw new Error(`ruleset ${ruleset.id} scoring.basePoints must be a positive integer`);
  }
  if (!Number.isInteger(ruleset.scoring.selfDrawFan) || ruleset.scoring.selfDrawFan < 0) {
    throw new Error(`ruleset ${ruleset.id} scoring.selfDrawFan must be a non-negative integer`);
  }
  if (!["replace", "stack"].includes(ruleset.scoring.specialSelfDrawMode)) {
    throw new Error(`ruleset ${ruleset.id} scoring.specialSelfDrawMode must be replace or stack`);
  }
  if (ruleset.scoring.aggregation !== "sum" && ruleset.scoring.aggregation !== "highest") {
    throw new Error(`ruleset ${ruleset.id} scoring.aggregation must be sum or highest`);
  }
}

for (const ruleset of RULESETS) {
  assertRulesetShape(ruleset);
}

function cloneRuleset(ruleset) {
  return JSON.parse(JSON.stringify(ruleset));
}

function getRulesets() {
  return RULESETS.map(cloneRuleset);
}

function getRuleset(rulesetId) {
  if (typeof rulesetId !== "string" || rulesetId.length === 0) {
    throw new Error("rulesetId must be a non-empty string");
  }
  const ruleset = RULESETS_BY_ID[rulesetId];
  if (ruleset === undefined) {
    throw new Error(`Unknown rulesetId: ${rulesetId}`);
  }
  return cloneRuleset(ruleset);
}

function getAllowedTileIds(ruleset) {
  assertRulesetShape(ruleset);
  return Object.keys(ruleset.tileCounts);
}

module.exports = {
  DEFAULT_RULESET_ID,
  getRulesets,
  getRuleset,
  getAllowedTileIds,
  assertRulesetShape
};
