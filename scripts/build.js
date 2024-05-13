// scripts/build.js

const { exec } = require("child_process");
const rimraf = require("rimraf");

// Clean the build directory
rimraf.sync("dist");

// Run build tasks in parallel
exec("npm run copy-files && npm run install-deps", (error, stdout, stderr) => {
  if (error) {
    console.error(`Error during build: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Error during build: ${stderr}`);
    return;
  }
  console.log(`Build output: ${stdout}`);
});
