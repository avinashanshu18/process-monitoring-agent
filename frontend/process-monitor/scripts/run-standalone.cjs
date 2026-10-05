const fs = require("fs");
const path = require("path");

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");
const sourceStaticDir = path.join(root, ".next", "static");
const targetStaticDir = path.join(standaloneDir, ".next", "static");
const sourcePublicDir = path.join(root, "public");
const targetPublicDir = path.join(standaloneDir, "public");

process.env.PORT = process.env.PORT || "3001";
process.env.HOSTNAME = process.env.HOSTNAME || "127.0.0.1";

if (!fs.existsSync(path.join(standaloneDir, "server.js"))) {
  throw new Error("Standalone server build is missing. Run `npm run build` first.");
}

if (fs.existsSync(sourceStaticDir)) {
  fs.mkdirSync(path.dirname(targetStaticDir), { recursive: true });
  fs.cpSync(sourceStaticDir, targetStaticDir, { recursive: true, force: true });
}

if (fs.existsSync(sourcePublicDir)) {
  fs.cpSync(sourcePublicDir, targetPublicDir, { recursive: true, force: true });
}

require(path.join(standaloneDir, "server.js"));
