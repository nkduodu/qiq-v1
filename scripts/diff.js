const fs = require("fs");
const path = require("path");

function getHistoryFiles() {
  const dir = path.join(__dirname, "../data/history");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.startsWith("insurance-products-") && f.endsWith(".json"))
    .sort();
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath));
}

function keyOf(p) {
  return `${p.insurer}::${p.product || p.name}::${p.type}`;
}

function diff(oldArr, newArr) {
  const oldMap = new Map(oldArr.map(p => [keyOf(p), p]));
  const newMap = new Map(newArr.map(p => [keyOf(p), p]));

  const added = [];
  const removed = [];

  for (const [k, v] of newMap.entries()) {
    if (!oldMap.has(k)) added.push(v);
  }

  for (const [k, v] of oldMap.entries()) {
    if (!newMap.has(k)) removed.push(v);
  }

  return { added, removed };
}

function run() {
  const files = getHistoryFiles();

  if (files.length < 2) {
    console.log("Not enough history files to diff.");
    return;
  }

  const latest = files[files.length - 1];
  const previous = files[files.length - 2];

  const latestData = loadJson(path.join(__dirname, "../data/history", latest));
  const prevData = loadJson(path.join(__dirname, "../data/history", previous));

  const result = diff(prevData, latestData);

  const outDir = path.join(__dirname, "../data/diff");
  fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, "latest-diff.json");

  fs.writeFileSync(outPath, JSON.stringify({
    previous,
    latest,
    addedCount: result.added.length,
    removedCount: result.removed.length,
    added: result.added,
    removed: result.removed
  }, null, 2));

  console.log("Diff written to:", outPath);
}

run();
