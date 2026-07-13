const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createServer } = require("../server/server");

async function main() {
  const server = createServer();
  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  try {
    const address = server.address();
    if (address === null || typeof address === "string") {
      throw new Error("Unexpected server address");
    }

    const baseUrl = `http://127.0.0.1:${address.port}`;
    const health = await fetchJson(`${baseUrl}/health`);
    assert.equal(health.ok, true);

    const rulesets = await fetchJson(`${baseUrl}/rulesets`);
    assert.equal(rulesets.defaultRulesetId, "sichuan-xueliu");
    assert.equal(rulesets.rulesets.length, 3);
    assert.equal(rulesets.rulesets[0].id, "sichuan-xueliu");
    assert.ok(rulesets.rulesets.some((ruleset) => ruleset.id === "sichuan-xueliu"));
    assert.ok(rulesets.rulesets.some((ruleset) => ruleset.id === "sichuan-xuezhan"));
    assert.ok(rulesets.rulesets.some((ruleset) => ruleset.id === "hongzhong"));

    const xueliu = await fetchJson(`${baseUrl}/rulesets/sichuan-xueliu`);
    assert.equal(xueliu.ruleset.gameplay.continueAfterWin, true);
    assert.equal(xueliu.ruleset.gameplay.maxWinners, 0);
    assert.equal(xueliu.ruleset.gameplay.winnerExitsAfterWin, false);
    assert.equal(xueliu.ruleset.gameplay.allowRepeatWins, true);
    assert.equal(xueliu.ruleset.gameplay.allowPengAfterWin, false);
    assert.equal(xueliu.ruleset.gameplay.roundEndMode, "wallEmpty");
    assert.equal(xueliu.ruleset.gameplay.drawSettlementPlayerScope, "nonWinners");

    const xuezhan = await fetchJson(`${baseUrl}/rulesets/sichuan-xuezhan`);
    assert.equal(xuezhan.ruleset.tileCounts.z5, undefined);
    assert.equal(Object.keys(xuezhan.ruleset.tileCounts).length, 27);
    assert.equal(xuezhan.ruleset.gameplay.requiresDingque, true);
    assert.equal(xuezhan.ruleset.gameplay.mustDiscardDingqueFirst, true);
    assert.equal(xuezhan.ruleset.gameplay.requiresExchangeThree, true);
    assert.equal(xuezhan.ruleset.gameplay.dingqueBeforeExchange, true);
    assert.equal(xuezhan.ruleset.gameplay.exchangeUsesDingqueSuit, true);
    assert.equal(xuezhan.ruleset.gameplay.exchangeAllowMixedFillWhenInsufficient, true);
    assert.equal(xuezhan.ruleset.gameplay.allowPeng, true);
    assert.equal(xuezhan.ruleset.gameplay.allowGang, true);
    assert.equal(xuezhan.ruleset.gameplay.allowRobGang, true);
    assert.equal(xuezhan.ruleset.gameplay.continueAfterWin, true);
    assert.equal(xuezhan.ruleset.gameplay.maxWinners, 3);
    assert.equal(xuezhan.ruleset.gameplay.winnerExitsAfterWin, true);
    assert.equal(xuezhan.ruleset.gameplay.allowRepeatWins, false);
    assert.equal(xuezhan.ruleset.gameplay.roundEndMode, "winnerLimitOrWallEmpty");
    assert.equal(xuezhan.ruleset.gameplay.drawSettlementPlayerScope, "nonWinners");
    assert.equal(xuezhan.ruleset.gameplay.gangPaoTransferMode, "refund");
    assert.equal(xuezhan.ruleset.scoring.aggregation, "sum");

    const hongzhong = await fetchJson(`${baseUrl}/rulesets/hongzhong`);
    assert.equal(hongzhong.ruleset.gameplay.drawSettlementPlayerScope, "none");

    const exchange = await postJson(`${baseUrl}/ai/exchange`, {
      rulesetId: "sichuan-xuezhan",
      hand: [
        "m1", "m2", "m3", "m4", "m5",
        "p1", "p2", "p3",
        "s1", "s2", "s3", "s4", "s5"
      ],
      lackSuit: "p"
    });
    assert.equal(exchange.tiles.length, 3);
    assert.equal(new Set(exchange.tiles.map((tile) => tile[0])).size, 1);

    const shortageExchange = await postJson(`${baseUrl}/ai/exchange`, {
      rulesetId: "sichuan-xuezhan",
      hand: [
        "m4", "m5", "m5", "m6",
        "p1", "p1", "p1", "p2", "p3", "p5", "p6", "p7",
        "s5", "s8"
      ],
      lackSuit: "s"
    });
    assert.equal(shortageExchange.suit, "s");
    assert.equal(shortageExchange.usesMixedFill, true);
    assert.equal(shortageExchange.tiles.length, 3);
    assert.ok(shortageExchange.tiles.includes("s5"));
    assert.ok(shortageExchange.tiles.includes("s8"));

    const lackSuit = await postJson(`${baseUrl}/ai/lack-suit`, {
      rulesetId: "sichuan-xuezhan",
      hand: [
        "m1", "m2",
        "p1", "p2", "p3", "p4", "p5",
        "s1", "s2", "s3", "s4", "s5", "s6"
      ]
    });
    assert.equal(lackSuit.lackSuit, "m");

    const analysis = await postJson(`${baseUrl}/ai/analyze`, {
      rulesetId: "hongzhong",
      hand: [
        "m1", "m2", "m3",
        "m4", "m5", "m6",
        "p2", "p3", "p4",
        "s7", "s8",
        "p9", "p9",
        "m9"
      ],
      visibleTiles: [],
      lackSuit: null
    });
    assert.equal(analysis.tileCount, 14);
    assert.equal(Array.isArray(analysis.readyDiscards), true);

    const decision = await postJson(`${baseUrl}/ai/discard`, {
      rulesetId: "hongzhong",
      hand: [
        "m1", "m2", "m3",
        "m4", "m5", "m6",
        "p2", "p3", "p4",
        "s7", "s8",
        "p9", "p9",
        "m9"
      ],
      visibleTiles: [],
      lackSuit: null,
      mustDiscard: false
    });
    assert.equal(decision.action, "discard");
    assert.equal(typeof decision.reason, "string");

    const score = await postJson(`${baseUrl}/ai/score`, {
      rulesetId: "hongzhong",
      hand: [
        "m1", "m2", "z5",
        "m4", "m5", "m6",
        "p2", "p3", "p4",
        "s7", "s8", "s9",
        "p9", "p9"
      ],
      lackSuit: null
    });
    assert.equal(score.isWinning, true);
    assert.ok(score.patterns.some((pattern) => pattern.id === "hongZhong"));

    const projectRoot = path.join(__dirname, "..");
    for (const relativePath of [
      "client/main.js",
      "client/preload.js",
      "client/hand-layout.js",
      "client/post-win-turn.js",
      "client/turn-order.js",
      "client/index.html",
      "client/renderer.js",
      "client/styles.css",
      "assets/img/table-bg.jpg",
      "assets/sounds/nv/hu.mp3",
      "assets/sounds/nv/peng.mp3",
      "assets/sounds/nv/gang.mp3",
      "assets/sounds/nv/patterns/ping-hu.wav",
      "assets/sounds/nv/patterns/ji-chu-hu.wav",
      "assets/sounds/nv/patterns/dui-dui-hu.wav",
      "assets/sounds/nv/patterns/peng-peng-hu.wav",
      "assets/sounds/nv/patterns/qing-yi-se.wav",
      "assets/sounds/nv/patterns/qi-dui.wav",
      "assets/sounds/nv/patterns/hong-zhong.wav",
      "assets/sounds/nv/patterns/gen.wav",
      "assets/sounds/nv/patterns/gang.wav",
      "assets/sounds/nv/patterns/jin-gou-diao.wav",
      "assets/sounds/nv/patterns/gang-shang-hua.wav",
      "assets/sounds/nv/patterns/gang-shang-pao.wav",
      "assets/sounds/nv/patterns/qiang-gang.wav",
      "assets/sounds/nv/patterns/hai-di.wav",
      "assets/sounds/action-prompt.wav"
    ]) {
      assert.equal(fs.existsSync(path.join(projectRoot, relativePath)), true, `${relativePath} must exist`);
    }

    const tileAssetIds = [
      ...["m", "p", "s"].flatMap((suit) => Array.from({ length: 9 }, (_value, index) => `${suit}${index + 1}`)),
      ...Array.from({ length: 7 }, (_value, index) => `z${index + 1}`)
    ];
    for (const tile of tileAssetIds) {
      const imagePath = `assets/img/tiles/${tile}.svg`;
      assert.equal(fs.existsSync(path.join(projectRoot, imagePath)), true, `${imagePath} must exist`);
    }

    const tileSoundCodes = [
      ...Array.from({ length: 9 }, (_value, index) => index + 1),
      ...Array.from({ length: 9 }, (_value, index) => index + 11),
      ...Array.from({ length: 9 }, (_value, index) => index + 21),
      ...Array.from({ length: 7 }, (_value, index) => (index + 3) * 10 + 1)
    ];
    for (const soundCode of tileSoundCodes) {
      const soundPath = `assets/sounds/nv/${soundCode}.mp3`;
      assert.equal(fs.existsSync(path.join(projectRoot, soundPath)), true, `${soundPath} must exist`);
    }
  } finally {
    await closeServer(server);
  }
}

async function closeServer(server) {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

async function fetchJson(url) {
  const response = await fetch(url);
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error);
  }
  return body;
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error);
  }
  return body;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
