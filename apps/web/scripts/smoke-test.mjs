import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const root = dirname(fileURLToPath(import.meta.url));
const detailPage = readFileSync(join(root, "../src/app/teleconsultations/[id]/page.tsx"), "utf8");

assert.match(detailPage, /const form = event\.currentTarget;/, "Detail page must keep a stable form reference before async work.");
assert.doesNotMatch(
  detailPage,
  /event\.currentTarget\.reset\(\)/,
  "Detail page must not reset through event.currentTarget after an async request."
);

console.log("web smoke test: parecer form reset regression covered");
