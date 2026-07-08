const { app, BrowserWindow } = require("electron");
const path = require("node:path");
const { fork } = require("node:child_process");
const http = require("node:http");
const fs = require("node:fs");

const SERVICE_PORT = 5057;
const SERVICE_URL = `http://127.0.0.1:${SERVICE_PORT}`;

let strategyServer = null;
let mainWindow = null;

function healthCheck(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(`${url}/health`, (response) => {
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

async function startStrategyServer() {
  const serverEntry = path.join(__dirname, "..", "server", "server.js");
  strategyServer = fork(serverEntry, [], {
    env: {
      ...process.env,
      PORT: String(SERVICE_PORT),
      ELECTRON_RUN_AS_NODE: "1"
    },
    stdio: ["ignore", "pipe", "pipe", "ipc"]
  });

  strategyServer.stdout.on("data", (chunk) => {
    process.stdout.write(`[strategy] ${chunk}`);
  });
  strategyServer.stderr.on("data", (chunk) => {
    process.stderr.write(`[strategy] ${chunk}`);
  });
  strategyServer.on("exit", (code, signal) => {
    if (mainWindow !== null && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("strategy-service-exited", { code, signal });
    }
  });

  await waitForStrategyService(SERVICE_URL);
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
  const image = await mainWindow.webContents.capturePage();
  fs.writeFileSync(process.env.MAHJONG_CAPTURE_PATH, image.toPNG());
  process.stdout.write(`[electron] captured ${process.env.MAHJONG_CAPTURE_PATH}\n`);
  if (process.env.MAHJONG_QUIT_AFTER_CAPTURE === "1") {
    app.quit();
  }
}

app.whenReady().then(async () => {
  await startStrategyServer();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (strategyServer !== null && !strategyServer.killed) {
    strategyServer.kill();
  }
});
