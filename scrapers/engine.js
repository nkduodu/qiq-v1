const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { sources } = require("./config");

async function scrapeSource(src) {
  try {
    const res = await fetch(src.url);
    const html = await res.text();

    // Placeholder extraction
    return [
      {
        insurer: src.name,
        product: "Sample Product",
        type: "auto",
        role: "insurer",
        description: "Placeholder scraped product",
        link: src.url
      }
    ];
  } catch (err) {
    console.error("Scraper failed:", src.name, err);
    return [];
  }
}

async function run() {
  let all = [];

  for (const src of sources) {
    if (!src.enabled) continue;
    console.log("Scraping:", src.name);
    const items = await scrapeSource(src);
    all = all.concat(items);
  }

  const outPath = path.join(__dirname, "../data/raw.json");
  fs.writeFileSync(outPath, JSON.stringify(all, null, 2));

  console.log("Raw data written to:", outPath);
}

module.exports = { run };
