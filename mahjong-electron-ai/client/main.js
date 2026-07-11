const { app, BrowserWindow, Menu, ipcMain } = require("electron");
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
let menuState = {
  rulesets: [],
  currentRulesetId: null,
  canStartRound: false,
  canAskAi: false,
  canUpdateRules: true,
  advisorVisible: false
};

app.name = "麻将 AI 训练";

function sendMenuCommand(command) {
  if (mainWindow === null || mainWindow.isDestroyed()) {
    throw new Error(`Cannot send menu command without a main window: ${command.type}`);
  }
  mainWindow.webContents.send("menu:command", command);
}

function buildApplicationMenu() {
  const template = [];
  if (process.platform === "darwin") {
    template.push({
      label: app.name,
      submenu: [
        { role: "about", label: `关于${app.name}` },
        { type: "separator" },
        { role: "hide", label: `隐藏${app.name}` },
        { role: "hideOthers", label: "隐藏其他" },
        { role: "unhide", label: "全部显示" },
        { type: "separator" },
        { role: "quit", label: `退出${app.name}` }
      ]
    });
  }
  template.push(
    {
      label: "牌局",
      submenu: [
        {
          id: "new-round",
          label: "新牌局",
          accelerator: "CmdOrCtrl+N",
          enabled: menuState.canStartRound,
          click: () => sendMenuCommand({ type: "newRound" })
        },
        {
          id: "ai-suggestion",
          label: "AI 建议",
          accelerator: "CmdOrCtrl+I",
          enabled: menuState.canAskAi,
          click: () => sendMenuCommand({ type: "askAi" })
        },
        { type: "separator" },
        {
          id: "update-rules",
          label: "更新玩法",
          enabled: menuState.canUpdateRules,
          click: () => sendMenuCommand({ type: "updateRules" })
        },
        {
          label: "开局玩法",
          enabled: menuState.rulesets.length > 0,
          submenu: menuState.rulesets.map((ruleset, index) => ({
            id: `ruleset-${index}`,
            type: "radio",
            label: ruleset.label,
            checked: ruleset.id === menuState.currentRulesetId,
            click: () => sendMenuCommand({ type: "changeRuleset", rulesetId: ruleset.id })
          }))
        }
      ]
    },
    {
      label: "视图",
      submenu: [
        {
          id: "toggle-advisor",
          type: "checkbox",
          label: "显示策略面板",
          accelerator: "CmdOrCtrl+Shift+A",
          checked: menuState.advisorVisible,
          click: (menuItem) => sendMenuCommand({ type: "setAdvisorVisible", visible: menuItem.checked })
        },
        { type: "separator" },
        { role: "togglefullscreen", label: "切换全屏" }
      ]
    }
  );
  if (process.platform === "darwin") {
    template.push({ role: "windowMenu", label: "窗口" });
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function synchronizeApplicationMenu() {
  const menu = Menu.getApplicationMenu();
  if (menu === null) {
    throw new Error("application menu is not available");
  }
  menu.getMenuItemById("new-round").enabled = menuState.canStartRound;
  menu.getMenuItemById("ai-suggestion").enabled = menuState.canAskAi;
  menu.getMenuItemById("update-rules").enabled = menuState.canUpdateRules;
  menu.getMenuItemById("toggle-advisor").checked = menuState.advisorVisible;
  for (let index = 0; index < menuState.rulesets.length; index += 1) {
    menu.getMenuItemById(`ruleset-${index}`).checked = menuState.rulesets[index].id === menuState.currentRulesetId;
  }
}

function assertMenuState(payload) {
  if (payload === null || typeof payload !== "object") {
    throw new Error("menu state must be an object");
  }
  if (!Array.isArray(payload.rulesets)) {
    throw new Error("menu state rulesets must be an array");
  }
  for (const ruleset of payload.rulesets) {
    if (
      ruleset === null
      || typeof ruleset !== "object"
      || typeof ruleset.id !== "string"
      || ruleset.id.length === 0
      || typeof ruleset.label !== "string"
      || ruleset.label.length === 0
    ) {
      throw new Error("menu state contains an invalid ruleset");
    }
  }
  if (payload.currentRulesetId !== null && typeof payload.currentRulesetId !== "string") {
    throw new Error("menu state currentRulesetId must be a string or null");
  }
  for (const field of ["canStartRound", "canAskAi", "canUpdateRules", "advisorVisible"]) {
    if (typeof payload[field] !== "boolean") {
      throw new Error(`menu state ${field} must be boolean`);
    }
  }
}

ipcMain.on("menu:update-state", (_event, payload) => {
  assertMenuState(payload);
  const nextRulesets = payload.rulesets.map((ruleset) => ({ id: ruleset.id, label: ruleset.label }));
  const rulesetsChanged = JSON.stringify(menuState.rulesets) !== JSON.stringify(nextRulesets);
  menuState = {
    rulesets: nextRulesets,
    currentRulesetId: payload.currentRulesetId,
    canStartRound: payload.canStartRound,
    canAskAi: payload.canAskAi,
    canUpdateRules: payload.canUpdateRules,
    advisorVisible: payload.advisorVisible
  };
  if (rulesetsChanged) {
    buildApplicationMenu();
    return;
  }
  synchronizeApplicationMenu();
});

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
    title: "麻将 AI 训练",
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
  if (process.env.MAHJONG_CAPTURE_EXCHANGE_AI === "1") {
    await mainWindow.webContents.executeJavaScript(`
      (() => {
        const panel = document.getElementById("exchangePanel");
        const aiButton = document.getElementById("askAiButton");
        if (panel === null || panel.hidden) {
          throw new Error("exchangePanel is not active");
        }
        if (aiButton === null) {
          throw new Error("askAiButton missing");
        }
        aiButton.click();
      })();
    `);
    await delay(1000);
    await mainWindow.webContents.executeJavaScript(`
      (() => {
        const confirmButton = document.getElementById("confirmExchangeButton");
        if (confirmButton === null || confirmButton.disabled) {
          throw new Error("confirmExchangeButton is not ready");
        }
        confirmButton.click();
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
    buildApplicationMenu();
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
