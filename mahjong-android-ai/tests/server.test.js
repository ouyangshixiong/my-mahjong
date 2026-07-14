"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  ConfigurationError,
  loadBootstrapConfig,
  validateRulesConfig,
  validateSplashAd
} = require("../server/config-loader");
const { createServer } = require("../server/http-server");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const SOURCE_CONFIG_DIR = path.join(PROJECT_ROOT, "server", "config");
const PUBLIC_DIR = path.join(PROJECT_ROOT, "server", "public");

async function makeConfigFixture(t) {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), "mahjong-server-test-"));
  t.after(() => fs.rm(fixtureDir, { recursive: true, force: true }));
  await Promise.all([
    fs.copyFile(path.join(SOURCE_CONFIG_DIR, "rules.json"), path.join(fixtureDir, "rules.json")),
    fs.copyFile(path.join(SOURCE_CONFIG_DIR, "splash-ad.json"), path.join(fixtureDir, "splash-ad.json"))
  ]);
  return fixtureDir;
}

async function startTestServer(t, configDir) {
  const server = createServer(configDir, PUBLIC_DIR);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error === undefined ? resolve() : reject(error));
  }));
  const address = server.address();
  assert.notEqual(address, null);
  assert.equal(typeof address, "object");
  return `http://127.0.0.1:${address.port}`;
}

async function responseJson(response) {
  const source = await response.text();
  return JSON.parse(source);
}

test("checked-in bootstrap configuration is complete and valid", async () => {
  const bootstrap = await loadBootstrapConfig(SOURCE_CONFIG_DIR);

  assert.equal(bootstrap.schemaVersion, 1);
  assert.equal(bootstrap.rules.defaultRulesetId, "sichuan-xueliu");
  assert.equal(bootstrap.rules.rulesets.length, 3);
  assert.deepEqual(bootstrap.splashAd, {
    id: "sample-splash",
    enabled: true,
    imageUrl: "/assets/splash-ad.svg",
    clickUrl: "https://github.com/ouyangshixiong/my-mahjong",
    durationMs: 3000,
    altText: "开发者推荐"
  });
});

test("validators reject unknown fields, unsafe ads, and unavailable defaults", async () => {
  const bootstrap = await loadBootstrapConfig(SOURCE_CONFIG_DIR);
  const rulesWithUnknownField = structuredClone(bootstrap.rules);
  rulesWithUnknownField.rulesets[0].unexpected = true;
  assert.throws(
    () => validateRulesConfig(rulesWithUnknownField),
    (error) => error instanceof ConfigurationError && /unsupported field: unexpected/.test(error.message)
  );

  const missingDefault = structuredClone(bootstrap.rules);
  missingDefault.defaultRulesetId = "missing-ruleset";
  assert.throws(
    () => validateRulesConfig(missingDefault),
    /defaultRulesetId is unavailable/
  );

  assert.throws(
    () => validateSplashAd({
      ...bootstrap.splashAd,
      clickUrl: "http://unsafe.example/"
    }),
    /credential-free HTTPS URL/
  );
  assert.throws(
    () => validateSplashAd({
      id: "disabled-ad",
      enabled: false,
      imageUrl: "/assets/splash-ad.svg",
      clickUrl: null,
      durationMs: 0,
      altText: ""
    }),
    /disabled splashAd/
  );
  assert.deepEqual(validateSplashAd({
    id: "disabled-ad",
    enabled: false,
    imageUrl: null,
    clickUrl: null,
    durationMs: 0,
    altText: ""
  }), {
    id: "disabled-ad",
    enabled: false,
    imageUrl: null,
    clickUrl: null,
    durationMs: 0,
    altText: ""
  });
  assert.throws(
    () => validateSplashAd({
      ...bootstrap.splashAd,
      imageUrl: "/assets/not-served.svg"
    }),
    /local path must equal \/assets\/splash-ad\.svg/
  );

  const unsupportedChi = structuredClone(bootstrap.rules);
  unsupportedChi.rulesets[0].gameplay.allowChi = true;
  assert.throws(
    () => validateRulesConfig(unsupportedChi),
    /allowChi must be false/
  );

  const inconsistentBaseFan = structuredClone(bootstrap.rules);
  inconsistentBaseFan.rulesets[0].scoring.baseFan = 1;
  assert.throws(
    () => validateRulesConfig(inconsistentBaseFan),
    /baseFan must equal the single base pattern fan/
  );
});

test("bootstrap endpoint returns fresh rules and splash-ad config with CORS", async (t) => {
  const configDir = await makeConfigFixture(t);
  const baseUrl = await startTestServer(t, configDir);

  const firstResponse = await fetch(`${baseUrl}/api/v1/bootstrap`);
  assert.equal(firstResponse.status, 200);
  assert.equal(firstResponse.headers.get("access-control-allow-origin"), "*");
  assert.equal(firstResponse.headers.get("cache-control"), "no-store");
  const first = await responseJson(firstResponse);
  assert.equal(first.splashAd.id, "sample-splash");

  const changedAd = {
    ...first.splashAd,
    id: "changed-splash",
    durationMs: 4500
  };
  await fs.writeFile(
    path.join(configDir, "splash-ad.json"),
    `${JSON.stringify(changedAd, null, 2)}\n`,
    "utf8"
  );

  const secondResponse = await fetch(`${baseUrl}/api/v1/bootstrap`);
  assert.equal(secondResponse.status, 200);
  const second = await responseJson(secondResponse);
  assert.equal(second.splashAd.id, "changed-splash");
  assert.equal(second.splashAd.durationMs, 4500);
});

test("invalid replacement config fails instead of serving the previous valid response", async (t) => {
  const configDir = await makeConfigFixture(t);
  const baseUrl = await startTestServer(t, configDir);

  const validResponse = await fetch(`${baseUrl}/api/v1/bootstrap`);
  assert.equal(validResponse.status, 200);

  await fs.writeFile(path.join(configDir, "splash-ad.json"), "{ invalid json", "utf8");
  const invalidResponse = await fetch(`${baseUrl}/api/v1/bootstrap`);
  assert.equal(invalidResponse.status, 500);
  assert.equal(invalidResponse.headers.get("cache-control"), "no-store");
  const errorPayload = await responseJson(invalidResponse);
  assert.equal(errorPayload.error.code, "SERVER_CONFIG_INVALID");
  assert.match(errorPayload.error.message, /splash-ad\.json contains invalid JSON/);
});

test("only the declared splash asset is served", async (t) => {
  const configDir = await makeConfigFixture(t);
  const baseUrl = await startTestServer(t, configDir);

  const assetResponse = await fetch(`${baseUrl}/assets/splash-ad.svg`);
  assert.equal(assetResponse.status, 200);
  assert.match(assetResponse.headers.get("content-type"), /^image\/svg\+xml/);
  assert.equal(assetResponse.headers.get("access-control-allow-origin"), "*");
  assert.match(await assetResponse.text(), /<svg/);

  const unknownAssetResponse = await fetch(`${baseUrl}/assets/other.svg`);
  assert.equal(unknownAssetResponse.status, 404);
  assert.equal((await responseJson(unknownAssetResponse)).error.code, "NOT_FOUND");
});

test("CORS preflight succeeds and unsupported request shapes are rejected", async (t) => {
  const configDir = await makeConfigFixture(t);
  const baseUrl = await startTestServer(t, configDir);

  const optionsResponse = await fetch(`${baseUrl}/api/v1/bootstrap`, { method: "OPTIONS" });
  assert.equal(optionsResponse.status, 204);
  assert.equal(optionsResponse.headers.get("access-control-allow-methods"), "GET, OPTIONS");

  const postResponse = await fetch(`${baseUrl}/api/v1/bootstrap`, { method: "POST" });
  assert.equal(postResponse.status, 405);
  assert.equal(postResponse.headers.get("allow"), "GET, OPTIONS");

  const queryResponse = await fetch(`${baseUrl}/api/v1/bootstrap?cache=false`);
  assert.equal(queryResponse.status, 400);
  assert.equal((await responseJson(queryResponse)).error.code, "QUERY_NOT_ALLOWED");
});
