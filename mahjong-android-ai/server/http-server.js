"use strict";

const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const { ConfigurationError, loadBootstrapConfig } = require("./config-loader");

const BOOTSTRAP_PATH = "/api/v1/bootstrap";
const SPLASH_ASSET_PATH = "/assets/splash-ad.svg";
const KNOWN_PATHS = new Set([BOOTSTRAP_PATH, SPLASH_ASSET_PATH]);

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Accept, Content-Type",
    "Access-Control-Max-Age": "600",
    "X-Content-Type-Options": "nosniff"
  };
}

function sendJson(response, statusCode, payload, headers) {
  const body = Buffer.from(JSON.stringify(payload));
  response.writeHead(statusCode, {
    ...corsHeaders(),
    ...headers,
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": body.length
  });
  response.end(body);
}

function sendEmpty(response, statusCode, headers) {
  response.writeHead(statusCode, {
    ...corsHeaders(),
    ...headers
  });
  response.end();
}

function parseRequestUrl(request) {
  if (typeof request.url !== "string") {
    throw new Error("request URL is missing");
  }
  return new URL(request.url, "http://server.invalid");
}

function createRequestHandler(configDir, publicDir) {
  if (typeof configDir !== "string" || !path.isAbsolute(configDir)) {
    throw new TypeError("configDir must be an absolute path");
  }
  if (typeof publicDir !== "string" || !path.isAbsolute(publicDir)) {
    throw new TypeError("publicDir must be an absolute path");
  }

  return async function handleRequest(request, response) {
    let url;
    try {
      url = parseRequestUrl(request);
    } catch (error) {
      sendJson(response, 400, {
        error: { code: "INVALID_REQUEST_URL", message: error.message }
      }, { "Cache-Control": "no-store" });
      return;
    }

    if (!KNOWN_PATHS.has(url.pathname)) {
      sendJson(response, 404, {
        error: { code: "NOT_FOUND", message: "Route not found" }
      }, { "Cache-Control": "no-store" });
      return;
    }
    if (url.search !== "") {
      sendJson(response, 400, {
        error: { code: "QUERY_NOT_ALLOWED", message: "Query parameters are not allowed" }
      }, { "Cache-Control": "no-store" });
      return;
    }
    if (request.method === "OPTIONS") {
      sendEmpty(response, 204, { "Cache-Control": "public, max-age=600" });
      return;
    }
    if (request.method !== "GET") {
      sendJson(response, 405, {
        error: { code: "METHOD_NOT_ALLOWED", message: "Only GET and OPTIONS are allowed" }
      }, { Allow: "GET, OPTIONS", "Cache-Control": "no-store" });
      return;
    }

    if (url.pathname === SPLASH_ASSET_PATH) {
      try {
        const body = await fs.readFile(path.join(publicDir, "splash-ad.svg"));
        response.writeHead(200, {
          ...corsHeaders(),
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Content-Length": body.length,
          "Cache-Control": "public, max-age=300"
        });
        response.end(body);
      } catch (error) {
        sendJson(response, 500, {
          error: { code: "SPLASH_ASSET_UNAVAILABLE", message: "Splash asset cannot be read" }
        }, { "Cache-Control": "no-store" });
      }
      return;
    }

    try {
      const bootstrap = await loadBootstrapConfig(configDir);
      sendJson(response, 200, bootstrap, { "Cache-Control": "no-store" });
    } catch (error) {
      const code = error instanceof ConfigurationError
        ? "SERVER_CONFIG_INVALID"
        : "INTERNAL_SERVER_ERROR";
      sendJson(response, 500, {
        error: {
          code,
          message: error instanceof ConfigurationError ? error.message : "Internal server error"
        }
      }, { "Cache-Control": "no-store" });
    }
  };
}

function createServer(configDir, publicDir) {
  const handler = createRequestHandler(configDir, publicDir);
  return http.createServer((request, response) => {
    handler(request, response).catch((error) => {
      if (!response.headersSent) {
        sendJson(response, 500, {
          error: { code: "INTERNAL_SERVER_ERROR", message: "Internal server error" }
        }, { "Cache-Control": "no-store" });
        return;
      }
      response.destroy(error);
    });
  });
}

module.exports = {
  BOOTSTRAP_PATH,
  SPLASH_ASSET_PATH,
  createRequestHandler,
  createServer
};
