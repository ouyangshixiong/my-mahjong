const { app, BrowserWindow } = require("electron");
const path = require("node:path");
const http = require("node:http");
const https = require("node:https");
const { URL } = require("node:url");
const fs = require("node:fs");

function getServiceUrl() {
  const value = process.env.MAHJONG_SERVICE_URL;
  if (typeof value !== "string" || value.length === 0) {
    throw new Error("MAHJONG_SERVICE_URL is required");
  }

  const parsed = new URL(value);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("MAHJONG_SERVICE_URL must use http or https");
  }
  if (parsed.username.length > 0 || parsed.password.length > 0) {
    throw new Error("MAHJONG_SERVICE_URL must not contain credentials");
  }
  if (parsed.search.length > 0 || parsed.hash.length > 0) {
    throw new Error("MAHJONG_SERVICE_URL must not contain a query or fragment");
  }

  return value.replace(/\/+$/, "");
}

const SERVICE_URL = getServiceUrl();

let mainWindow = null;

function healthCheck(url) {
  return new Promise((resolve, reject) => {
    const endpoint = new URL(`${url}/health`);
    const transport = endpoint.protocol === "https:" ? https : http;
    const request = transport.get(endpoint, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        if (response.statusCode !== 200) {
          reject(new Error(`Strategy service health check returned ${response.statusCode}`));
          return;
        }
        const payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        if (payload.ok !== true) {
          reject(new Error("Strategy service health payload is not ok"));
          return;
        }
        resolve();
      });
    });
    request.on("error", reject);
    request.setTimeout(1500, () => {
      request.destroy(new Error("Strategy service health check timed out"));
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForStrategyService(url) {
  let lastError = null;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      await healthCheck(url);
      return;
    } catch (error) {
      lastError = error;
      await delay(250);
    }
  }
  throw new Error(`Strategy service did not become healthy: ${lastError.message}`);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1080,
    minHeight: 720,
    title: "BeiMi Mahjong AI Trainer",
    backgroundColor: "#10231f",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      additionalArguments: [`--ai-service-url=${SERVICE_URL}`]
    }
  });

  mainWindow.webContents.on("did-finish-load", () => {
    process.stdout.write("[electron] renderer loaded\n");
    captureWindowForVerification().catch((error) => {
      process.stderr.write(`[electron] capture failed: ${error.message}\n`);
    });
  });
  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
    process.stderr.write(`[electron] renderer failed to load ${errorCode}: ${errorDescription}\n`);
  });
  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    process.stderr.write(`[electron] renderer gone: ${details.reason}\n`);
  });
  mainWindow.on("ready-to-show", () => {
    process.stdout.write("[electron] window ready to show\n");
  });

  process.stdout.write("[electron] creating main window\n");
  mainWindow.loadFile(path.join(__dirname, "index.html"));
}

async function captureWindowForVerification() {
  if (typeof process.env.MAHJONG_CAPTURE_PATH !== "string" || process.env.MAHJONG_CAPTURE_PATH.length === 0) {
    return;
  }
  await delay(1500);
  if (mainWindow === null || mainWindow.isDestroyed()) {
    throw new Error("main window is not available for capture");
  }
  if (typeof process.env.MAHJONG_CAPTURE_RULESET_ID === "string" && process.env.MAHJONG_CAPTURE_RULESET_ID.length > 0) {
    await mainWindow.webContents.executeJavaScript(`
      (() => {
        const select = document.getElementById("rulesetSelect");
        if (select === null) {
          throw new Error("rulesetSelect missing");
        }
        select.value = ${JSON.stringify(process.env.MAHJONG_CAPTURE_RULESET_ID)};
        select.dispatchEvent(new Event("change", { bubbles: true }));
      })();
    `);
    await delay(1500);
  }
  if (typeof process.env.MAHJONG_CAPTURE_LACK_SUIT === "string" && process.env.MAHJONG_CAPTURE_LACK_SUIT.length > 0) {
    if (!["m", "p", "s"].includes(process.env.MAHJONG_CAPTURE_LACK_SUIT)) {
      throw new Error("MAHJONG_CAPTURE_LACK_SUIT must be m, p, or s");
    }
    await mainWindow.webContents.executeJavaScript(`
      (() => {
        const button = document.querySelector(${JSON.stringify(`[data-lack-suit="${process.env.MAHJONG_CAPTURE_LACK_SUIT}"]`)});
        if (button === null) {
          throw new Error("dingque button missing");
        }
        button.click();
      })();
    `);
    await delay(1500);
  }
  if (process.env.MAHJONG_CAPTURE_DISCARD_FIRST === "1") {
    await mainWindow.webContents.executeJavaScript(`
      (() => {
        const tile = document.querySelector("#selfHand .tile.interactive");
        if (tile === null) {
          throw new Error("no legal interactive discard found");
        }
        tile.click();
      })();
    `);
    await delay(3500);
  }
  const image = await mainWindow.webContents.capturePage();
  fs.writeFileSync(process.env.MAHJONG_CAPTURE_PATH, image.toPNG());
  process.stdout.write(`[electron] captured ${process.env.MAHJONG_CAPTURE_PATH}\n`);
  if (process.env.MAHJONG_QUIT_AFTER_CAPTURE === "1") {
    app.quit();
  }
}

app.whenReady()
  .then(async () => {
    await waitForStrategyService(SERVICE_URL);
    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  })
  .catch((error) => {
    process.stderr.write(`[electron] startup failed: ${error.message}\n`);
    app.exit(1);
  });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
