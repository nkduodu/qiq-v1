const fs = require("fs");
const path = require("path");

const API_KEY = process.env.PUBLIC_API_KEY || "dev-key";
const PLAN = process.env.PUBLIC_API_PLAN || "free";

const limits = { free: 1000, pro: 10000, enterprise: Infinity };
const memory = {};

function rateLimit(apiKey, plan) {
  const now = Date.now();
  const window = 60 * 60 * 1000;
  const limit = limits[plan] || limits.free;

  if (!memory[apiKey]) {
    memory[apiKey] = { count: 1, start: now };
    return true;
  }

  const entry = memory[apiKey];

  if (now - entry.start > window) {
    entry.count = 1;
    entry.start = now;
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const key = event.headers["x-api-key"];
  if (!key || key !== API_KEY) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  if (!rateLimit(key, PLAN)) {
    return { statusCode: 429, body: "Rate limit exceeded" };
  }

  const { type, insurer, role, tenantId } = event.queryStringParameters || {};
  const dataPath = path.join(__dirname, "../data/curated/insurance-products.json");
  const products = JSON.parse(fs.readFileSync(dataPath));

  const filtered = products
    .filter(p => !type || p.type === type)
    .filter(p => !insurer || p.insurer === insurer)
    .filter(p => !role || (p.role || "insurer") === role)
    .filter(p => !tenantId || p.tenantId === tenantId);

  return {
    statusCode: 200,
    body: JSON.stringify(filtered)
  };
};
