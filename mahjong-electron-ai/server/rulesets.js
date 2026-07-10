const { TILE_DEFS } = require("./mahjong");

const SUITED_TILE_IDS = Object.freeze([
  "m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9",
  "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9",
  "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"
]);

function tileCounts(tileIds) {
  return Object.fromEntries(tileIds.map((tile) => [tile, 4]));
}

const RULESETS = Object.freeze([
  Object.freeze({
    id: "sichuan-xuezhan",
    version: 4,
    updatedAt: "2026-07-10T00:00:00+08:00",
    name: "四川麻将血战",
    description: "三门 108 张，先定缺并优先打完缺门牌；不可吃，可一炮多响，胡牌后其余玩家继续血战。",
    tileCounts: Object.freeze(tileCounts(SUITED_TILE_IDS)),
    gameplay: Object.freeze({
      initialHandSize: 13,
      dealerDraws: 14,
      continueAfterWin: true,
      maxWinners: 3,
      requiresDingque: true,
      mustDiscardDingqueFirst: true,
      allowChi: false,
      allowDiscardWin: true,
      allowMultipleWinnersOnDiscard: true,
      forceWinOnLastFourTiles: true,
      settleFlowerPigOnDraw: true,
      settleReadyHandsOnDraw: true,
      wildcardTile: null,
      honorTilesEnabled: false,
      redCenterEnabled: false
    }),
    scoring: Object.freeze({
      aggregation: "highest",
      baseFan: 0,
      maxFan: 3,
      patterns: Object.freeze([
        Object.freeze({ id: "baseHu", name: "平胡", fan: 0, type: "base" }),
        Object.freeze({ id: "duiDuiHu", name: "对对胡", fan: 1, type: "allTriplets" }),
        Object.freeze({ id: "qingYiSe", name: "清一色", fan: 2, type: "pureSuit" }),
        Object.freeze({ id: "qiDui", name: "七对", fan: 2, type: "sevenPairs" }),
        Object.freeze({ id: "qingQiDui", name: "清七对", fan: 3, type: "pureSevenPairs" })
      ])
    })
  }),
  Object.freeze({
    id: "hongzhong",
    version: 2,
    updatedAt: "2026-07-08T19:20:00+08:00",
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
      requiresDingque: false,
      mustDiscardDingqueFirst: false,
      allowChi: false,
      allowDiscardWin: true,
      allowMultipleWinnersOnDiscard: false,
      forceWinOnLastFourTiles: false,
      settleFlowerPigOnDraw: false,
      settleReadyHandsOnDraw: false,
      wildcardTile: "z5",
      honorTilesEnabled: false,
      redCenterEnabled: true
    }),
    scoring: Object.freeze({
      aggregation: "sum",
      baseFan: 1,
      maxFan: 24,
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
    "requiresDingque",
    "mustDiscardDingqueFirst",
    "allowChi",
    "allowDiscardWin",
    "allowMultipleWinnersOnDiscard",
    "forceWinOnLastFourTiles",
    "settleFlowerPigOnDraw",
    "settleReadyHandsOnDraw",
    "honorTilesEnabled",
    "redCenterEnabled"
  ]) {
    if (!Object.prototype.hasOwnProperty.call(ruleset.gameplay, field)) {
      throw new Error(`ruleset ${ruleset.id} gameplay missing field: ${field}`);
    }
  }
  if (!Object.prototype.hasOwnProperty.call(ruleset.gameplay, "wildcardTile")) {
    throw new Error(`ruleset ${ruleset.id} gameplay missing field: wildcardTile`);
  }
  if (!Array.isArray(ruleset.scoring.patterns)) {
    throw new Error(`ruleset ${ruleset.id} scoring.patterns must be an array`);
  }
  if (ruleset.scoring.aggregation !== "sum" && ruleset.scoring.aggregation !== "highest") {
    throw new Error(`ruleset ${ruleset.id} scoring.aggregation must be sum or highest`);
  }
}

for (const ruleset of RULESETS) {
  assertRulesetShape(ruleset);
}

function getRulesets() {
  return RULESETS.map((ruleset) => structuredClone(ruleset));
}

function getRuleset(rulesetId) {
  if (typeof rulesetId !== "string" || rulesetId.length === 0) {
    throw new Error("rulesetId must be a non-empty string");
  }
  const ruleset = RULESETS_BY_ID[rulesetId];
  if (ruleset === undefined) {
    throw new Error(`Unknown rulesetId: ${rulesetId}`);
  }
  return structuredClone(ruleset);
}

function getAllowedTileIds(ruleset) {
  assertRulesetShape(ruleset);
  return Object.keys(ruleset.tileCounts);
}

module.exports = {
  getRulesets,
  getRuleset,
  getAllowedTileIds,
  assertRulesetShape
};
