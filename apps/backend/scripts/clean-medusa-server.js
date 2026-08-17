const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const target = path.join(repoRoot, ".medusa", "server");

try {
  if (fs.existsSync(target)) {
    console.log(`Removing ${target}...`);
    fs.rmSync(target, { recursive: true, force: true });
    console.log("Removed .medusa/server");
  } else {
    // also attempt relative from working dir
    const alt = path.join(process.cwd(), ".medusa", "server");
    if (fs.existsSync(alt)) {
      console.log(`Removing ${alt}...`);
      fs.rmSync(alt, { recursive: true, force: true });
      console.log("Removed .medusa/server (cwd)");
    } else {
      console.log("No .medusa/server directory found; nothing to remove.");
    }
  }
} catch (err) {
  console.warn("Failed to remove .medusa/server:", err.message);
  // don't fail the build; just exit successfully
}
