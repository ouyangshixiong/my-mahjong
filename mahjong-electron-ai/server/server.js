const http = require("node:http");
const { URL } = require("node:url");
const { analyzeHand, chooseExchangeTiles, chooseLackSuit, scoreHand, TILE_DEFS } = require("./mahjong");
const { recommendDiscard } = require("./ai");
const { getRuleset, getRulesets } = require("./rulesets");

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      const body = Buffer.concat(chunks).toString("utf8");
      if (body.length === 0) {
        reject(new Error("JSON request body is required"));
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error(`Invalid JSON request body: ${error.message}`));
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  });
  response.end(body);
}

function createServer() {
  return http.createServer(async (request, response) => {
    try {
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.setHeader("Access-Control-Allow-Headers", "content-type");
      response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

      if (request.method === "OPTIONS") {
        response.writeHead(204);
        response.end();
        return;
      }

      const url = new URL(request.url, `http://${request.headers.host}`);
      if (request.method === "GET" && url.pathname === "/health") {
        sendJson(response, 200, { ok: true, service: "mahjong-strategy" });
        return;
      }

      if (request.method === "GET" && url.pathname === "/ai/tiles") {
        sendJson(response, 200, { tiles: TILE_DEFS });
        return;
      }

      if (request.method === "GET" && url.pathname === "/rulesets") {
        sendJson(response, 200, { rulesets: getRulesets() });
        return;
      }

      if (request.method === "GET" && url.pathname.startsWith("/rulesets/")) {
        const rulesetId = decodeURIComponent(url.pathname.slice("/rulesets/".length));
        sendJson(response, 200, { ruleset: getRuleset(rulesetId) });
        return;
      }

      if (request.method === "POST" && url.pathname === "/ai/analyze") {
        const payload = await readRequestBody(request);
        const ruleset = getRuleset(payload.rulesetId);
        sendJson(response, 200, analyzeHand(payload, ruleset));
        return;
      }

      if (request.method === "POST" && url.pathname === "/ai/score") {
        const payload = await readRequestBody(request);
        const ruleset = getRuleset(payload.rulesetId);
        if (!Object.prototype.hasOwnProperty.call(payload, "lackSuit")) {
          throw new Error("lackSuit is required");
        }
        sendJson(response, 200, scoreHand(payload.hand, ruleset, payload.lackSuit));
        return;
      }

      if (request.method === "POST" && url.pathname === "/ai/lack-suit") {
        const payload = await readRequestBody(request);
        const ruleset = getRuleset(payload.rulesetId);
        sendJson(response, 200, chooseLackSuit(payload.hand, ruleset));
        return;
      }

      if (request.method === "POST" && url.pathname === "/ai/exchange") {
        const payload = await readRequestBody(request);
        const ruleset = getRuleset(payload.rulesetId);
        sendJson(response, 200, chooseExchangeTiles(payload.hand, ruleset));
        return;
      }

      if (request.method === "POST" && url.pathname === "/ai/discard") {
        const payload = await readRequestBody(request);
        sendJson(response, 200, recommendDiscard(payload));
        return;
      }

      sendJson(response, 404, { error: `Unknown route: ${request.method} ${url.pathname}` });
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }
  });
}

if (require.main === module) {
  const host = process.env.HOST;
  if (typeof host !== "string" || host.length === 0) {
    throw new Error("HOST is required");
  }
  const port = Number.parseInt(process.env.PORT, 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
  const server = createServer();
  server.listen(port, host, () => {
    process.stdout.write(`mahjong-strategy listening on ${host}:${port}\n`);
  });
}

module.exports = {
  createServer
};
