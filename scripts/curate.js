const fs = require("fs");
const path = require("path");

// v1: simple normalization pipeline
function run() {
  const rawPath = path.join(__dirname, "../data/raw.json");

  if (!fs.existsSync(rawPath)) {
    console.log("No raw data found. Skipping curate.");
    return;
  }

  const raw = JSON.parse(fs.readFileSync(rawPath));

  const curated = raw.map(p => ({
    insurer: p.insurer || "",
    product: p.product || p.name || "",
    type: (p.type || "other").toLowerCase(),
    role: p.role || "insurer",
    description: p.description || "",
    link: p.link || "",
    tenantId: p.tenantId || null
  }));

  const outPath = path.join(__dirname, "../data/curated/insurance-products.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(curated, null, 2));

  console.log("Curated data written to:", outPath);
}

run();
