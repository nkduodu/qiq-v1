const { run } = require("./engine");
const { execSync } = require("child_process");

async function main() {
  console.log("Running scrapers...");
  await run();

  console.log("Running curate...");
  execSync("node scripts/curate.js", { stdio: "inherit" });

  console.log("Running diff...");
  execSync("node scripts/diff.js", { stdio: "inherit" });

  console.log("Scraper pipeline complete.");
}

main();
