// import compiler from "@ampproject/rollup-plugin-closure-compiler";
import compiler from "./tools/rollup-shrink-compiler";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import replace from "@rollup/plugin-replace";
import html from "rollup-plugin-html";
import * as pkg from "./package.json";
import postcss from "rollup-plugin-postcss";
import path from "path";
import serve from "rollup-plugin-serve";
import svg from "rollup-plugin-svg";
import manipHtml, { NodeHTMLDoc } from "./tools/manip-html";
import { ChunkDescriptor } from "./tools/rollup-shrink-compiler/options";
import { Literal } from "estree";
import { copyFile, stat, writeFile } from "fs/promises";
import { InputOption, InputOptions, OutputBundle, Plugin } from "rollup";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { parsed: env } = require("dotenv-flow").config();
if (process.env.CI) {
  // Force settings for precommit hooks,
  // and (eventually) CI.
  env.USE_MOCKS = false;
  env.DEBUG = false;
  env.MODE = "prod";
}

if (!env.API_ENDPOINT) {
  env.API_ENDPOINT = "/api";
}
while (env.API_ENDPOINT.endsWith("/")) {
  env.API_ENDPOINT = env.API_ENDPOINT.substr(0, env.API_ENDPOINT.length - 1);
}

const dev = env.MODE !== "prod";
const version =
  env.VERSION !== undefined ? env.VERSION : pkg.version.replace("v", "");
const deps = { ...pkg.dependencies, ...pkg.devDependencies };

const plugins = [];
plugins.push(
  replace({
    preventAssignment: true,
    "process.env.DEBUG": JSON.stringify(env.DEBUG || dev),
    "process.env.NODE_ENV": JSON.stringify(env.MODE),
    "process.env.USE_MOCKS": JSON.stringify(env.USE_MOCKS),
    "process.env.API_ENDPOINT": JSON.stringify(env.API_ENDPOINT || ""),
    "process.env.WS_ENDPOINT": JSON.stringify(env.WS_ENDPOINT || ""),
    __VERSION__: version,
  }),
  typescript({
    sourceMap: dev,
  }),
  nodeResolve({
    mainFields: ["browser", "module", "main"],
  }),
  html({
    include: "**/*.html",
    htmlMinifierOptions: {
      collapseWhitespace: true,
    },
  }),
  postcss({
    minimize: !dev,
    config: true,
    inject: (cssVariableName, id) => {
      // global added to window via templateFunction
      return `stynj(${cssVariableName})`;
    },
  }),
  svg()
);

if (!dev) {
  plugins.push(
    compiler({
      language_in: "ECMASCRIPT_NEXT",
      language_out: "ECMASCRIPT_2020",
      compilation_level: "SIMPLE",
      // assume_function_wrapper: true,
      // allow_dynamic_import: true,
      // dynamic_import_alias: "import",
      externs: ["./tools/externs.js"],
      options: {
        ignoreDynamicImports: true,
        dynamicImportReinsertCallback: (node) => {
          // This allows Typescript to give type completion and hinting.
          // Any other assets that should be versioned can use the template
          // `file-__VERSION__.ext` and it will be filled in by scripts/build.uih.ts
          const { arguments: args } = node;
          const rawPath = (args[0] as Literal).raw;
          const spl = rawPath.split(".");
          const ext = spl.pop();
          return `import(${spl.join(".")}-${version}.${ext})`;
        },
        implicitChunkLoadOrder: {
          // app.ts is always loaded after
          // index by dynamic import
          "web/src/app.ts": ["web/index.ts"],
        },
        templateFunction,
      },
    })
  );
} else {
  plugins.push(
    devPlugin(),
    serve({
      port: 10002,
      contentBase: "public",
      historyApiFallback: true,
    })
  );
}

export default {
  input: [
    // order matters
    "web/tools/esp-inject.ts",
    "web/tools/style-inject.ts",
    "web/index.ts",
    "web/src/app.ts",
    dev && "web/tools/dev-inject.priv.ts", // always last
  ].filter((i) => !!i),
  output: {
    dir: "public",
    format: "es",
    sourcemap: dev,
    globals: {
      document: "document",
      window: "window",
    },
  },
  plugins,
};

async function manipIndex(chunks: string[]): Promise<NodeHTMLDoc> {
  const templateDoc = await manipHtml("./web/index.html");
  templateDoc.insertAtEndOf("body", `<script src="${chunks[0]}"></script>`); // esp-inject
  if (dev) {
    // in dev mode, last chunk is dev-specific IIFE script
    // load it after esp-inject since it overwrites that data
    templateDoc.insertAtEndOf(
      "body",
      `<script src="${chunks[chunks.length - 1]}"></script>`
    ); // index
  }
  templateDoc.insertAtEndOf("body", `<script src="${chunks[1]}"></script>`); // style-inject
  templateDoc.insertAtEndOf("body", `<script src="${chunks[2]}"></script>`); // index
  // chunks[3] == app.js, loaded async
  return templateDoc;
}

async function templateFunction(
  bundle: OutputBundle
): Promise<ChunkDescriptor[]> {
  const templateDoc = await manipIndex(Object.keys(bundle));

  return [
    {
      fileName: "index.html",
      source: templateDoc.toString(),
    },
  ];
}

async function copyDevFile(relPath: string) {
  const spl = relPath.split(".");
  const ext = spl.pop();
  const devFilePath = path.resolve(__dirname, spl.join(".") + "-dev." + ext);
  try {
    const s = await stat(devFilePath);
    // todo: cache and avoid copy only if file untouched
  } catch (e) {
    if (e.code === "ENOENT") {
      const ogFilePath = path.resolve(__dirname, relPath);
      await copyFile(ogFilePath, devFilePath);
    } else throw e;
  }
}

function devPlugin(): Plugin {
  let inputOptions: InputOptions;
  return {
    name: "dev-plugin",
    options: (options: InputOptions) => (inputOptions = options),
    buildStart: async function () {
      // if dev files don't exit, add them
      console.log("in dev plugin");
      await copyDevFile("./public/bg.jpg");

      // add some other stuff to watch
      this.addWatchFile(path.resolve(__dirname, "web/**/*.css"));
      this.addWatchFile(path.resolve(__dirname, "web/**/*.html"));
      this.addWatchFile(path.resolve(__dirname, "postcss.config.js"));
      this.addWatchFile(path.resolve(__dirname, "tsconfig.json"));
      this.addWatchFile(path.resolve(__dirname, ".env"));
      this.addWatchFile(path.resolve(__dirname, ".env.dev"));
    },
    generateBundle: async function (outputOptions, bundle) {
      await writeDevIndex(bundle);
    },
  };
}

async function writeDevIndex(bundle: OutputBundle): Promise<void> {
  const indexDoc = await manipIndex(Object.keys(bundle));
  await writeFile(
    path.resolve(__dirname, "./public/index.html"),
    indexDoc.toString()
  );
}
