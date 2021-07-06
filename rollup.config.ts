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
import importHtml from "./tools/import-html";
import { ChunkDescriptor } from "./tools/rollup-shrink-compiler/options";

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
    {
      name: "watch-external",
      buildStart() {
        this.addWatchFile(path.resolve(__dirname, "web/**/*.css"));
        this.addWatchFile(path.resolve(__dirname, "web/**/*.html"));
        this.addWatchFile(path.resolve(__dirname, "postcss.config.js"));
        this.addWatchFile(path.resolve(__dirname, "tsconfig.json"));
        this.addWatchFile(path.resolve(__dirname, ".env"));
        this.addWatchFile(path.resolve(__dirname, ".env.dev"));
      },
    },
    serve({
      port: 10002,
      contentBase: "public",
      historyApiFallback: true,
    })
  );
}

export default {
  input: ["web/style-inject.ts", "web/index.ts", "web/src/app.ts"],
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

async function templateFunction(names: string[]): Promise<ChunkDescriptor[]> {
  const template = await importHtml("./web/index.html");
  template.insertAtEndOf("body", `<script src="${names[0]}"></script>`);
  template.insertAtEndOf("body", `<script src="${names[1]}"></script>`);
  template.insertAtEndOf(
    "body",
    `<script>window.wblinds={inj:{ip:"$$$IP$$$",mac:"$$$MAC$$$"}};</script>`
  );

  return [
    {
      fileName: "index.html",
      source: template.toString(),
    },
  ];
}
