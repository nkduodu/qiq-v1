const fs = require("fs");
const path = require("path");
const { estimatePrice } = require("./pricing");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { session } = JSON.parse(event.body || "{}");
  const type = session?.type || "auto";
  const details = session?.details || {};

  const dataPath = path.join(__dirname, "../data/curated/insurance-products.json");
  const products = JSON.parse(fs.readFileSync(dataPath));

  const matches = products.filter(p => p.type === type).slice(0, 5);

  const quotes = matches.map(p => ({
    insurer: p.insurer,
    product: p.product || p.name,
    type: p.type,
    price: estimatePrice(type, details)
  }));

  return {
    statusCode: 200,
    body: JSON.stringify(quotes)
  };
};
