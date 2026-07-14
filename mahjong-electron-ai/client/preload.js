const { contextBridge, ipcRenderer } = require("electron");
const { URL } = require("node:url");
const {
  turnIndicatorFor: getTurnIndicatorFor,
  turnOrderFrom: getTurnOrderFrom
} = require("./turn-order");
const { arrangeHandForDrawPreview } = require("./hand-layout");
const { decidePostWinDraw } = require("./post-win-turn");
const {
  announcementPatternsForWin,
  declaredGangPatternForWin,
  displayPatternNamesForWin,
  multipleWinnerAnnouncementForCount,
  operationPatternForWin,
  rootCountForWin,
  scoreAmount,
  winContextAfterDiscard
} = require("./win-scoring");
const {
  discardGangPreservesWaits,
  waitPreservingSelfGangOptions
} = require("../server/mahjong");

function getServiceUrl() {
  const arg = process.argv.find((item) => item.startsWith("--ai-service-url="));
  if (arg === undefined) {
    throw new Error("Missing --ai-service-url argument");
  }
  const value = arg.slice("--ai-service-url=".length);
  const parsed = new URL(value);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("AI service URL must use http or https");
  }
  return value;
}

const serviceUrl = getServiceUrl();

async function requestJson(path, payload) {
  const response = await fetch(`${serviceUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error);
  }
  return data;
}

async function getJson(path) {
  const response = await fetch(`${serviceUrl}${path}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error);
  }
  return data;
}

contextBridge.exposeInMainWorld("mahjongAI", {
  serviceUrl,
  getRulesets() {
    return getJson("/rulesets");
  },
  getRuleset(rulesetId) {
    if (typeof rulesetId !== "string" || rulesetId.length === 0) {
      throw new Error("rulesetId must be a non-empty string");
    }
    return getJson(`/rulesets/${encodeURIComponent(rulesetId)}`);
  },
  analyze(payload) {
    return requestJson("/ai/analyze", payload);
  },
  score(payload) {
    return requestJson("/ai/score", payload);
  },
  chooseLackSuit(payload) {
    return requestJson("/ai/lack-suit", payload);
  },
  chooseExchangeTiles(payload) {
    return requestJson("/ai/exchange", payload);
  },
  recommendDiscard(payload) {
    return requestJson("/ai/discard", payload);
  },
  turnOrderFrom(playerIndex) {
    return getTurnOrderFrom(playerIndex);
  },
  turnIndicatorFor(playerIndex) {
    return getTurnIndicatorFor(playerIndex);
  },
  arrangeHandForDrawPreview(hand, drawnTile) {
    return arrangeHandForDrawPreview(hand, drawnTile);
  },
  decidePostWinDraw(hand, drawnTile, isWinning) {
    return decidePostWinDraw(hand, drawnTile, isWinning);
  },
  announcementPatternsForWin(patterns) {
    return announcementPatternsForWin(patterns);
  },
  declaredGangPatternForWin(melds) {
    return declaredGangPatternForWin(melds);
  },
  displayPatternNamesForWin(patterns) {
    return displayPatternNamesForWin(patterns);
  },
  multipleWinnerAnnouncementForCount(winnerCount) {
    return multipleWinnerAnnouncementForCount(winnerCount);
  },
  operationPatternForWin(settlementType, winContext, scoring) {
    return operationPatternForWin(settlementType, winContext, scoring);
  },
  rootCountForWin(hand, melds) {
    return rootCountForWin(hand, melds);
  },
  scoreAmount(scoring, cappedFan) {
    return scoreAmount(scoring, cappedFan);
  },
  winContextAfterDiscard(drawWinContext) {
    return winContextAfterDiscard(drawWinContext);
  },
  waitPreservingSelfGangOptions(hand, drawnTile, gangOptions, ruleset, lackSuit) {
    return waitPreservingSelfGangOptions(hand, drawnTile, gangOptions, ruleset, lackSuit);
  },
  discardGangPreservesWaits(hand, tile, ruleset, lackSuit) {
    return discardGangPreservesWaits(hand, tile, ruleset, lackSuit);
  },
  updateMenuState(payload) {
    ipcRenderer.send("menu:update-state", payload);
  },
  onMenuCommand(callback) {
    if (typeof callback !== "function") {
      throw new Error("menu command callback must be a function");
    }
    const listener = (_event, command) => callback(command);
    ipcRenderer.on("menu:command", listener);
    return () => ipcRenderer.removeListener("menu:command", listener);
  }
});
