/**
 * Script to build, inline, gzip UI source.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Inliner = require("inliner");
import { writeFile, readFile } from "fs/promises";
import { resolve as pathResolve, relative as relPath } from "path";
import * as zlib from "zlib";

const UINT16_MAX = 65535;

let fileCLength: number;
let nameCLength: number;
let trLogged = false;
const beforeCLength = 10;
const afterCLength = 10;
const statusCLength = 10;

const log = (...msgs: any[]) => {
  console.log("[build.ui]", ...msgs);
};
const warn = (...msgs: any[]) => {
  console.warn("[build.ui]", ...msgs);
};

interface Spec {
  name: string;
  filePath: string;
  method: "plaintext" | "binary";
  // replace strings after inlining
  replace?: [source: string | RegExp, target: string][];
  append?: string;
  prepend?: string;
  mangle?: (chunk: string) => string;
  inline?: boolean;
  gzip?: boolean;
}

interface ChunkData {
  outFile: string;
  specs: Spec[];
}

const ui_index_data: ChunkData = {
  outFile: "src/ui_index.h",
  specs: [
    {
      filePath: pathResolve(__dirname, "../public/index.html"),
      name: "HTML_index",
      method: "binary",
      inline: true,
      // For using asyncwebserver templates with embedded CSS
      // percents are escaped with "%%".
      // Replace the base escape character "$$$" with the
      // AWS replace character "%" afterwards.
      replace: [
        [
          `<link rel="icon" type="image/x-icon" href="data:image/x-icon;base64,">`,
          `<link rel="icon" type="image/x-icon" href="favicon.ico">`,
          // ``,
        ],
        [/%/g, "%%"],
        [/\$\$\$/g, "%"],
      ],
      gzip: false,
    },
    {
      filePath: pathResolve(__dirname, "../public/app.js"),
      name: "JS_app",
      method: "binary",
      gzip: true,
    },
  ],
};

const uiFixturesData: ChunkData = {
  outFile: "src/ui_fixtures.h",
  specs: [
    {
      filePath: pathResolve(__dirname, "../public/bg.jpg"),
      name: "IMG_background",
      method: "binary",
      inline: false,
      gzip: true,
    },
    {
      filePath: pathResolve(__dirname, "../public/favicon.ico"),
      name: "IMG_favicon",
      method: "binary",
      inline: false,
      gzip: true,
    },
  ],
};

writeChunks([ui_index_data, uiFixturesData]);

function hexDump(buffer: Buffer): string {
  return [...new Uint8Array(buffer)]
    .map((x) => "0x" + x.toString(16).padStart(2, "0"))
    .join(",");
}

function inlineFile(srcFilePath: string, opts?: any): Promise<string> {
  return new Promise((resolve, reject) => {
    new Inliner(srcFilePath, opts, function (err: Error, result: string) {
      if (err) {
        return reject(err);
      }
      console.log("inlined: ", result);
      resolve(result);
    });
  });
}

function gzipFile(input: Buffer | string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    zlib.gzip(
      input,
      { level: zlib.constants.Z_BEST_COMPRESSION },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
  });
}

/**
 * Get longest name of all specs
 * Used for formatting in logs
 * @param specs
 */
function getLongestRelPathLength(specs: Spec[]) {
  return specs
    .map((s) => relPath(pathResolve(__dirname, ".."), s.filePath).length)
    .sort((a, b) => b - a)[0];
}

function getLongestNameLength(specs: Spec[]) {
  return specs.map((s) => s.name.length).sort((a, b) => b - a)[0];
}

function logResult(s: Spec, _beforeSize: number, _afterSize?: number) {
  const { inline, gzip, filePath, name } = s;

  const beforeSize = _beforeSize.toString();
  const afterSize = _afterSize?.toString();
  const diffSize = (_beforeSize - _afterSize)?.toString();
  const relFile = relPath(pathResolve(__dirname, ".."), filePath);

  if (!trLogged) {
    trLogged = true;
    let outTR = "File".padEnd(fileCLength);
    outTR += "Name".padEnd(nameCLength);
    outTR += "Inlined".padEnd(statusCLength);
    outTR += "Zipped".padEnd(statusCLength);
    outTR += "Before".padEnd(beforeCLength);
    outTR += "After".padEnd(afterCLength);
    outTR += "Diff".padEnd(afterCLength);
    log(outTR);
    log("".padEnd(outTR.length, "="));
  }

  let resultRow = relFile.padEnd(fileCLength);
  resultRow += name.padEnd(nameCLength);
  resultRow += (inline ? "  ✔️" : "  ✖️").padEnd(statusCLength + 1);
  resultRow += (gzip ? "  ✔️" : "  ✖️").padEnd(statusCLength + 1);
  resultRow += beforeSize.padEnd(beforeCLength);
  if (gzip) {
    resultRow += afterSize.padEnd(afterCLength);
    resultRow += diffSize.padEnd(afterCLength);
  }

  log(resultRow);
}

async function specToChunk(s: Spec) {
  const { inline, method, gzip, filePath, name, prepend, append, replace } = s;

  let buf: Buffer | string;

  if (inline) {
    buf = await inlineFile(filePath, { images: false });
  }
  if (!buf) {
    buf = await readFile(filePath);
  }
  if (replace && replace.length > 0) {
    if (buf instanceof Buffer) {
      buf = buf.toString();
    }
    replace.forEach((r) => {
      buf = (buf as string).replace(...r);
    });
    console.log("replaced: ", buf);
  }

  const beforeSize = buf.length;
  let zippedSize: number;
  if (gzip) {
    buf = await gzipFile(buf);
    zippedSize = buf.length;
  }

  logResult(s, beforeSize, zippedSize);

  let chunk = `// Autogenerated from ${relPath(
    pathResolve(__dirname, "../src"),
    filePath
  )}, do not edit!!`;
  if (method == "plaintext") {
    buf = typeof buf === "string" ? buf : buf.toString("utf-8");
    chunk += `
 const uint8_t ${name}[] PROGMEM = R"${prepend || ""}${buf}${append || ""}";
 
 `;
  } else if (method == "binary") {
    buf = typeof buf === "string" ? Buffer.from(buf) : buf;
    const result = hexDump(buf);
    chunk += `
 const ${result.length > UINT16_MAX ? "uint32_t" : "uint16_t"} ${name}_L = ${
      buf.length
    };
 const uint8_t ${name}[] PROGMEM = {
 ${result}
 };
 
 `;
  } else {
    warn("Unknown method: " + method);
    return undefined;
  }

  return s.mangle ? s.mangle(chunk) : chunk;
}

async function writeChunks(data: ChunkData[]) {
  const allSpecs = data.reduce<Spec[]>((p, c) => [...p, ...c.specs], []);
  fileCLength = getLongestRelPathLength(allSpecs) + 4;
  nameCLength = getLongestNameLength(allSpecs) + 4;

  data.forEach(async ({ specs, outFile }) => {
    const ps = specs.map(specToChunk);

    const results = await Promise.allSettled(ps);
    const output = results
      .map((result) => {
        if (result.status === "fulfilled") {
          return result.value;
        }

        const { name, filePath, error } = result.reason;
        warn(`Failed to build ${name} from ${filePath}`, error);
        return "";
      })
      .join("");

    await writeFile(outFile, output);
  });
}
