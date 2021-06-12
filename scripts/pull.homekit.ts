/**
 * == WIP ==
 *
 * Script to pull ESP32 Homekit SDK
 *
 * See: https://github.com/espressif/esp-homekit-sdk
 * And: https://github.com/Brawrdon/esp-homekit-arduino-sdk/blob/main/build.py
 */

import * as fs from "fs/promises";
import { resolve } from "path";
import { spawn } from "child-process-promise";

const rootDir = resolve(__dirname, "..");
const sdkRepo = "https://github.com/espressif/esp-homekit-sdk.git";
const commit = "c62f64dea6669547182e932dfded0a3a912a1951";
const pullDir = "lib/esp-homekit-sdk/";
const pullLibDir = "lib/esp-homekit-sdk/components/homekit";
const libDir = "lib/homekit";

const privIncludes = "lib/priv_includes";

(async () => {
  try {
    await run();
  } catch (e) {
    console.error("[pull.homekit] Failed: ", e);
    process.exit(e.code || 1);
  }
})();

async function run() {
  const gitDir = resolve(pullDir, ".git");
  const pulled = await fileExists(gitDir);
  const exists = await fileExists(libDir);
  if (!pulled && !exists) {
    // clone
    await proc("git", "clone", "--recursive", sdkRepo, pullDir);
  }

  // checkout specific commit
  await proc("git", "--git-dir", gitDir, "checkout", commit);

  // Move over all src and headers
  const toCopy = resolve(rootDir, pullLibDir);
  await flatCopy(toCopy, libDir);
}

type CopyCondition = (allPaths: string[]) => boolean;
type CopyTransform = (src: Buffer) => Buffer;
async function flatCopy(
  source: string,
  target: string,
  condition?: CopyCondition,
  transform?: CopyTransform
): Promise<void> {
  return fs.readdir(source).then((res) => {
    console.log("res: ", res);
  });
}

/**
 * Check if file exists, relative to project root.
 * @param path
 * @returns
 */
function fileExists(...pathParts: string[]): Promise<boolean> {
  return fs
    .access(resolve(rootDir, ...pathParts))
    .then(() => true)
    .catch((e) => {
      if (e) return false;
    });
}

function proc(cmd: string, ...args: string[]) {
  let stdout = "";
  let stderr = "";

  const p = spawn(cmd, [...args]);
  p.childProcess.stdout.on("data", function (data) {
    stdout += data.toString();
  });
  p.childProcess.stderr.on("data", function (data) {
    stderr += data.toString();
  });

  return p.catch((e) => {
    console.log(stdout);
    console.error(stderr);
    throw e;
  });
}
