"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const { assertRulesetShape } = require("../game/rulesets");
const { TILE_DEFS } = require("../game/mahjong");

const MAX_CONFIG_BYTES = 1024 * 1024;
const RULESET_KEYS = Object.freeze([
  "id",
  "version",
  "updatedAt",
  "name",
  "description",
  "tileCounts",
  "gameplay",
  "scoring"
]);
const GAMEPLAY_KEYS = Object.freeze([
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
  "wildcardTile",
  "honorTilesEnabled",
  "redCenterEnabled"
]);
const SCORING_KEYS = Object.freeze([
  "aggregation",
  "basePoints",
  "baseFan",
  "maxFan",
  "selfDrawFan",
  "specialSelfDrawMode",
  "patterns"
]);
const PATTERN_KEYS = Object.freeze(["id", "name", "fan", "type"]);
const SPLASH_AD_KEYS = Object.freeze([
  "id",
  "enabled",
  "imageUrl",
  "clickUrl",
  "durationMs",
  "altText"
]);
const PATTERN_TYPES = Object.freeze([
  "base",
  "allTriplets",
  "pureSuit",
  "sevenPairs",
  "pureSevenPairs",
  "lacksOneSuit",
  "wildcardEach"
]);
const TILE_IDS = new Set(TILE_DEFS.map((tile) => tile.id));
const ID_PATTERN = /^[A-Za-z][A-Za-z0-9-]{0,63}$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/;
const LOCAL_SPLASH_ASSET_PATH = "assets/splash-ad.svg";

class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConfigurationError";
  }
}

function fail(message) {
  throw new ConfigurationError(message);
}

function assertObject(value, fieldPath) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    fail(`${fieldPath} must be an object`);
  }
}

function assertExactKeys(value, keys, fieldPath) {
  assertObject(value, fieldPath);
  const expected = new Set(keys);
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      fail(`${fieldPath} is missing field: ${key}`);
    }
  }
  for (const key of Object.keys(value)) {
    if (!expected.has(key)) {
      fail(`${fieldPath} contains unsupported field: ${key}`);
    }
  }
}

function assertString(value, fieldPath, allowEmpty) {
  if (typeof value !== "string" || (!allowEmpty && value.trim().length === 0)) {
    fail(`${fieldPath} must be ${allowEmpty ? "a string" : "a non-empty string"}`);
  }
}

function assertId(value, fieldPath) {
  if (typeof value !== "string" || !ID_PATTERN.test(value)) {
    fail(`${fieldPath} must match ${ID_PATTERN}`);
  }
}

function assertInteger(value, fieldPath, minimum, maximum) {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    fail(`${fieldPath} must be an integer from ${minimum} to ${maximum}`);
  }
}

function assertIsoDate(value, fieldPath) {
  if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value) || !Number.isFinite(Date.parse(value))) {
    fail(`${fieldPath} must be an ISO-8601 timestamp with a timezone`);
  }
}

function assertHttpsUrl(value, fieldPath) {
  assertString(value, fieldPath, false);
  let url;
  try {
    url = new URL(value);
  } catch {
    fail(`${fieldPath} must be a valid HTTPS URL`);
  }
  if (url.protocol !== "https:" || url.username !== "" || url.password !== "") {
    fail(`${fieldPath} must be a credential-free HTTPS URL`);
  }
}

function assertImageUrl(value, fieldPath) {
  if (value === LOCAL_SPLASH_ASSET_PATH) {
    return;
  }
  assertHttpsUrl(value, fieldPath);
}

function assertRuleset(ruleset, index) {
  const fieldPath = `rules.rulesets[${index}]`;
  assertExactKeys(ruleset, RULESET_KEYS, fieldPath);
  assertId(ruleset.id, `${fieldPath}.id`);
  assertInteger(ruleset.version, `${fieldPath}.version`, 1, Number.MAX_SAFE_INTEGER);
  assertIsoDate(ruleset.updatedAt, `${fieldPath}.updatedAt`);
  assertString(ruleset.name, `${fieldPath}.name`, false);
  assertString(ruleset.description, `${fieldPath}.description`, false);

  assertObject(ruleset.tileCounts, `${fieldPath}.tileCounts`);
  const tileEntries = Object.entries(ruleset.tileCounts);
  if (tileEntries.length === 0 || tileEntries.length > TILE_IDS.size) {
    fail(`${fieldPath}.tileCounts must contain from 1 to ${TILE_IDS.size} tiles`);
  }
  for (const [tileId, count] of tileEntries) {
    if (!TILE_IDS.has(tileId)) {
      fail(`${fieldPath}.tileCounts contains unknown tile: ${tileId}`);
    }
    if (count !== 4) {
      fail(`${fieldPath}.tileCounts.${tileId} must equal 4`);
    }
  }

  assertExactKeys(ruleset.gameplay, GAMEPLAY_KEYS, `${fieldPath}.gameplay`);
  if (ruleset.gameplay.allowChi !== false) {
    fail(`${fieldPath}.gameplay.allowChi must be false because chi is not implemented`);
  }
  const hasRedCenter = Object.prototype.hasOwnProperty.call(ruleset.tileCounts, "z5");
  const hasOtherHonors = ["z1", "z2", "z3", "z4", "z6", "z7"]
    .some((tileId) => Object.prototype.hasOwnProperty.call(ruleset.tileCounts, tileId));
  if (ruleset.gameplay.redCenterEnabled !== hasRedCenter) {
    fail(`${fieldPath}.gameplay.redCenterEnabled must match whether tileCounts contains z5`);
  }
  if (ruleset.gameplay.honorTilesEnabled !== hasOtherHonors) {
    fail(`${fieldPath}.gameplay.honorTilesEnabled must match non-red-center honor tiles in tileCounts`);
  }
  if (
    ruleset.gameplay.wildcardTile !== null
    && (
      typeof ruleset.gameplay.wildcardTile !== "string"
      || !Object.prototype.hasOwnProperty.call(ruleset.tileCounts, ruleset.gameplay.wildcardTile)
    )
  ) {
    fail(`${fieldPath}.gameplay.wildcardTile must be null or a tile in tileCounts`);
  }

  assertExactKeys(ruleset.scoring, SCORING_KEYS, `${fieldPath}.scoring`);
  assertInteger(ruleset.scoring.basePoints, `${fieldPath}.scoring.basePoints`, 1, Number.MAX_SAFE_INTEGER);
  assertInteger(ruleset.scoring.baseFan, `${fieldPath}.scoring.baseFan`, 0, Number.MAX_SAFE_INTEGER);
  assertInteger(ruleset.scoring.maxFan, `${fieldPath}.scoring.maxFan`, 0, Number.MAX_SAFE_INTEGER);
  assertInteger(ruleset.scoring.selfDrawFan, `${fieldPath}.scoring.selfDrawFan`, 0, Number.MAX_SAFE_INTEGER);
  if (ruleset.scoring.maxFan < ruleset.scoring.baseFan) {
    fail(`${fieldPath}.scoring.maxFan must be at least baseFan`);
  }
  if (!Array.isArray(ruleset.scoring.patterns) || ruleset.scoring.patterns.length === 0) {
    fail(`${fieldPath}.scoring.patterns must be a non-empty array`);
  }
  const patternIds = new Set();
  ruleset.scoring.patterns.forEach((pattern, patternIndex) => {
    const patternPath = `${fieldPath}.scoring.patterns[${patternIndex}]`;
    assertExactKeys(pattern, PATTERN_KEYS, patternPath);
    assertId(pattern.id, `${patternPath}.id`);
    assertString(pattern.name, `${patternPath}.name`, false);
    assertInteger(pattern.fan, `${patternPath}.fan`, 0, Number.MAX_SAFE_INTEGER);
    if (!PATTERN_TYPES.includes(pattern.type)) {
      fail(`${patternPath}.type is unsupported: ${pattern.type}`);
    }
    if (patternIds.has(pattern.id)) {
      fail(`${fieldPath}.scoring.patterns contains duplicate id: ${pattern.id}`);
    }
    patternIds.add(pattern.id);
  });
  if (
    ruleset.scoring.patterns.some((pattern) => pattern.type === "wildcardEach")
    && ruleset.gameplay.wildcardTile === null
  ) {
    fail(`${fieldPath} cannot use wildcardEach without a wildcardTile`);
  }
  const basePatterns = ruleset.scoring.patterns.filter((pattern) => pattern.type === "base");
  if (basePatterns.length !== 1 || basePatterns[0].fan !== ruleset.scoring.baseFan) {
    fail(`${fieldPath}.scoring.baseFan must equal the single base pattern fan`);
  }

  try {
    assertRulesetShape(ruleset);
  } catch (error) {
    fail(`${fieldPath} is invalid: ${error.message}`);
  }
}

function validateRulesConfig(config) {
  assertExactKeys(config, ["defaultRulesetId", "rulesets"], "rules");
  assertId(config.defaultRulesetId, "rules.defaultRulesetId");
  if (!Array.isArray(config.rulesets) || config.rulesets.length === 0) {
    fail("rules.rulesets must be a non-empty array");
  }
  const rulesetIds = new Set();
  config.rulesets.forEach((ruleset, index) => {
    assertRuleset(ruleset, index);
    if (rulesetIds.has(ruleset.id)) {
      fail(`rules.rulesets contains duplicate id: ${ruleset.id}`);
    }
    rulesetIds.add(ruleset.id);
  });
  if (!rulesetIds.has(config.defaultRulesetId)) {
    fail(`rules.defaultRulesetId is unavailable: ${config.defaultRulesetId}`);
  }
  return config;
}

function validateSplashAd(config) {
  assertExactKeys(config, SPLASH_AD_KEYS, "splashAd");
  assertId(config.id, "splashAd.id");
  if (typeof config.enabled !== "boolean") {
    fail("splashAd.enabled must be boolean");
  }
  if (config.enabled) {
    assertImageUrl(config.imageUrl, "splashAd.imageUrl");
    assertHttpsUrl(config.clickUrl, "splashAd.clickUrl");
    assertInteger(config.durationMs, "splashAd.durationMs", 1000, 15000);
    assertString(config.altText, "splashAd.altText", false);
  } else if (
    config.imageUrl !== null
    || config.clickUrl !== null
    || config.durationMs !== 0
    || config.altText !== ""
  ) {
    fail("disabled splashAd must use null URLs, durationMs 0, and empty altText");
  }
  return config;
}

async function readJsonFile(filePath, label) {
  let source;
  try {
    source = await fs.readFile(filePath, "utf8");
  } catch (error) {
    fail(`${label} cannot be read`);
  }
  if (Buffer.byteLength(source, "utf8") > MAX_CONFIG_BYTES) {
    fail(`${label} exceeds ${MAX_CONFIG_BYTES} bytes`);
  }
  try {
    return JSON.parse(source);
  } catch (error) {
    fail(`${label} contains invalid JSON: ${error.message}`);
  }
}

async function loadBootstrapConfig(configDir) {
  if (typeof configDir !== "string" || !path.isAbsolute(configDir)) {
    fail("configDir must be an absolute path");
  }
  const [rules, splashAd] = await Promise.all([
    readJsonFile(path.join(configDir, "rules.json"), "rules.json"),
    readJsonFile(path.join(configDir, "splash-ad.json"), "splash-ad.json")
  ]);
  return {
    schemaVersion: 1,
    rules: validateRulesConfig(rules),
    splashAd: validateSplashAd(splashAd)
  };
}

module.exports = {
  ConfigurationError,
  loadBootstrapConfig,
  validateRulesConfig,
  validateSplashAd
};
