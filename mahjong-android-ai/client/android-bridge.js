const { recommendDiscard } = require("../game/ai");
const {
  analyzeHand,
  chooseExchangeTiles,
  chooseLackSuit,
  discardGangPreservesWaits,
  scoreHand,
  waitPreservingSelfGangOptions
} = require("../game/mahjong");
const { arrangeHandForDrawPreview } = require("../game/hand-layout");
const { decidePostWinDraw } = require("../game/post-win-turn");
const { turnIndicatorFor, turnOrderFrom } = require("../game/turn-order");
const {
  announcementPatternsForWin,
  declaredGangPatternForWin,
  displayPatternNamesForWin,
  multipleWinnerAnnouncementForCount,
  operationPatternForWin,
  rootCountForWin,
  scoreAmount
} = require("../game/win-scoring");

const DEVELOPMENT_HTTP_HOSTS = Object.freeze(["127.0.0.1", "localhost", "10.0.2.2"]);
const BOOTSTRAP_TIMEOUT_MS = 15000;
const serviceUrl = readServiceUrl();

let bootstrap = null;
let rulesetsById = new Map();

function readServiceUrl() {
  const value = new URLSearchParams(window.location.search).get("serviceUrl");
  if (value === null || value.length === 0) {
    throw new Error("serviceUrl query parameter is required");
  }
  const parsed = new URL(value);
  const secure = parsed.protocol === "https:";
  const development = parsed.protocol === "http:" && DEVELOPMENT_HTTP_HOSTS.includes(parsed.hostname);
  if (!secure && !development) {
    throw new Error("serviceUrl must use HTTPS outside an explicit development host");
  }
  if (parsed.username.length > 0 || parsed.password.length > 0) {
    throw new Error("serviceUrl must not contain credentials");
  }
  if (parsed.search.length > 0 || parsed.hash.length > 0) {
    throw new Error("serviceUrl must not contain a query or fragment");
  }
  return value.replace(/\/+$/, "");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function requireObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
}

function resolveRemoteUrl(value, label, allowNull) {
  if (allowNull && value === null) {
    return null;
  }
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty string${allowNull ? " or null" : ""}`);
  }
  const parsed = new URL(value, `${serviceUrl}/`);
  const secure = parsed.protocol === "https:";
  const development = parsed.protocol === "http:" && DEVELOPMENT_HTTP_HOSTS.includes(parsed.hostname);
  if (!secure && !development) {
    throw new Error(`${label} must resolve to HTTPS outside an explicit development host`);
  }
  return parsed.toString();
}

function validateBootstrap(payload) {
  requireObject(payload, "bootstrap");
  if (payload.schemaVersion !== 1) {
    throw new Error(`unsupported bootstrap schemaVersion: ${payload.schemaVersion}`);
  }
  requireObject(payload.rules, "bootstrap.rules");
  if (typeof payload.rules.defaultRulesetId !== "string" || payload.rules.defaultRulesetId.length === 0) {
    throw new Error("bootstrap.rules.defaultRulesetId must be a non-empty string");
  }
  if (!Array.isArray(payload.rules.rulesets) || payload.rules.rulesets.length === 0) {
    throw new Error("bootstrap.rules.rulesets must be a non-empty array");
  }
  const ids = new Set();
  for (const ruleset of payload.rules.rulesets) {
    requireObject(ruleset, "ruleset");
    if (typeof ruleset.id !== "string" || ruleset.id.length === 0) {
      throw new Error("ruleset.id must be a non-empty string");
    }
    if (ids.has(ruleset.id)) {
      throw new Error(`duplicate ruleset id: ${ruleset.id}`);
    }
    ids.add(ruleset.id);
  }
  if (!ids.has(payload.rules.defaultRulesetId)) {
    throw new Error(`default ruleset is unavailable: ${payload.rules.defaultRulesetId}`);
  }

  requireObject(payload.splashAd, "bootstrap.splashAd");
  const ad = payload.splashAd;
  if (typeof ad.id !== "string" || ad.id.length === 0) {
    throw new Error("splashAd.id must be a non-empty string");
  }
  if (typeof ad.enabled !== "boolean") {
    throw new Error("splashAd.enabled must be boolean");
  }
  if (!Number.isInteger(ad.durationMs) || ad.durationMs < 0 || ad.durationMs > 30000) {
    throw new Error("splashAd.durationMs must be an integer from 0 to 30000");
  }
  if (ad.enabled && ad.durationMs === 0) {
    throw new Error("enabled splashAd.durationMs must be greater than zero");
  }
  if (!ad.enabled && ad.durationMs !== 0) {
    throw new Error("disabled splashAd.durationMs must be zero");
  }
  if (ad.enabled) {
    if (typeof ad.altText !== "string" || ad.altText.length === 0) {
      throw new Error("enabled splashAd.altText must be a non-empty string");
    }
    resolveRemoteUrl(ad.imageUrl, "splashAd.imageUrl", false);
    resolveRemoteUrl(ad.clickUrl, "splashAd.clickUrl", false);
  } else if (ad.imageUrl !== null || ad.clickUrl !== null || ad.altText !== "") {
    throw new Error("disabled splashAd imageUrl and clickUrl must be null and altText must be empty");
  }
}

async function fetchBootstrap() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BOOTSTRAP_TIMEOUT_MS);
  try {
    const response = await fetch(`${serviceUrl}/api/v1/bootstrap`, {
      method: "GET",
      cache: "no-store",
      redirect: "error",
      headers: { Accept: "application/json" },
      signal: controller.signal
    });
    const payload = await response.json();
    if (!response.ok) {
      const serverMessage = payload.error !== null
        && typeof payload.error === "object"
        && typeof payload.error.message === "string"
        ? payload.error.message
        : `bootstrap request failed: ${response.status}`;
      throw new Error(serverMessage);
    }
    validateBootstrap(payload);
    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

function installBootstrap(payload) {
  bootstrap = clone(payload);
  rulesetsById = new Map(bootstrap.rules.rulesets.map((ruleset) => [ruleset.id, ruleset]));
  if (bootstrap.splashAd.enabled) {
    bootstrap.splashAd.imageUrl = resolveRemoteUrl(bootstrap.splashAd.imageUrl, "splashAd.imageUrl", false);
    bootstrap.splashAd.clickUrl = resolveRemoteUrl(bootstrap.splashAd.clickUrl, "splashAd.clickUrl", false);
  }
}

function requireBootstrap() {
  if (bootstrap === null) {
    throw new Error("bootstrap has not been loaded");
  }
  return bootstrap;
}

function rulesetFor(rulesetId) {
  if (typeof rulesetId !== "string" || rulesetId.length === 0) {
    throw new Error("rulesetId must be a non-empty string");
  }
  requireBootstrap();
  const ruleset = rulesetsById.get(rulesetId);
  if (ruleset === undefined) {
    throw new Error(`unknown server rulesetId: ${rulesetId}`);
  }
  return ruleset;
}

function requireLackSuit(payload) {
  if (!Object.prototype.hasOwnProperty.call(payload, "lackSuit")) {
    throw new Error("lackSuit is required");
  }
}

window.mahjongAI = Object.freeze({
  serviceUrl,
  async initialize() {
    installBootstrap(await fetchBootstrap());
    return { splashAd: clone(bootstrap.splashAd) };
  },
  async refreshRulesets() {
    installBootstrap(await fetchBootstrap());
  },
  async getRulesets() {
    const current = requireBootstrap();
    return clone(current.rules);
  },
  async getRuleset(rulesetId) {
    return { ruleset: clone(rulesetFor(rulesetId)) };
  },
  async analyze(payload) {
    return analyzeHand(payload, rulesetFor(payload.rulesetId));
  },
  async score(payload) {
    requireLackSuit(payload);
    return scoreHand(payload.hand, rulesetFor(payload.rulesetId), payload.lackSuit);
  },
  async chooseLackSuit(payload) {
    return chooseLackSuit(payload.hand, rulesetFor(payload.rulesetId));
  },
  async chooseExchangeTiles(payload) {
    requireLackSuit(payload);
    return chooseExchangeTiles(payload.hand, rulesetFor(payload.rulesetId), payload.lackSuit);
  },
  async recommendDiscard(payload) {
    return recommendDiscard(payload, rulesetFor(payload.rulesetId));
  },
  turnOrderFrom,
  turnIndicatorFor,
  arrangeHandForDrawPreview,
  decidePostWinDraw,
  announcementPatternsForWin,
  declaredGangPatternForWin,
  displayPatternNamesForWin,
  multipleWinnerAnnouncementForCount,
  operationPatternForWin,
  rootCountForWin,
  scoreAmount,
  waitPreservingSelfGangOptions,
  discardGangPreservesWaits,
  updateMenuState(payload) {
    requireObject(payload, "menu state");
  },
  onMenuCommand(callback) {
    if (typeof callback !== "function") {
      throw new Error("menu command callback must be a function");
    }
    return () => {};
  }
});
