const { contextBridge, ipcRenderer } = require("electron");

function getServiceUrl() {
  const arg = process.argv.find((item) => item.startsWith("--ai-service-url="));
  if (arg === undefined) {
    throw new Error("Missing --ai-service-url argument");
  }
  const value = arg.slice("--ai-service-url=".length);
  if (!value.startsWith("http://127.0.0.1:")) {
    throw new Error(`Unexpected AI service URL: ${value}`);
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
  recommendDiscard(payload) {
    return requestJson("/ai/discard", payload);
  },
  onServiceExit(callback) {
    ipcRenderer.on("strategy-service-exited", (_event, details) => callback(details));
  }
});
