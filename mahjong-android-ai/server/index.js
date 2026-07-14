"use strict";

const path = require("node:path");
const { createServer } = require("./http-server");

function parsePort(value) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new Error("PORT must be set to an integer from 1 to 65535");
  }
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be set to an integer from 1 to 65535");
  }
  return port;
}

const port = parsePort(process.env.PORT);
const host = process.env.HOST;
if (typeof host !== "string" || host.length === 0) {
  throw new Error("HOST is required");
}
const configDir = path.join(__dirname, "config");
const publicDir = path.join(__dirname, "public");
const server = createServer(configDir, publicDir);

server.listen(port, host, () => {
  process.stdout.write(`mahjong server listening on ${host}:${port}\n`);
});
