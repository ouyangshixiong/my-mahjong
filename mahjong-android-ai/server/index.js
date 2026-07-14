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
const configDir = path.join(__dirname, "config");
const publicDir = path.join(__dirname, "public");
const server = createServer(configDir, publicDir);

server.listen(port, "0.0.0.0", () => {
  process.stdout.write(`mahjong server listening on port ${port}\n`);
});
