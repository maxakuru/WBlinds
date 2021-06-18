/* eslint-disable @typescript-eslint/no-var-requires */
import compiler from "@ampproject/rollup-plugin-closure-compiler";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import replace from "@rollup/plugin-replace";
import html from "rollup-plugin-html";
import pkg from "./package.json";
import postcss from "rollup-plugin-postcss";
import path from "path";

const { parsed: env } = require("dotenv-flow").config();
const dev = env.MODE !== "prod";
if (process.env.CI) {
  env.USE_MOCKS = false;
}

const deps = { ...pkg.dependencies, ...pkg.devDependencies };

const plugins = [];
plugins.push(
  replace({
    preventAssignment: true,
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
  commonjs({ include: "node_modules/**" }),
  postcss({ minimize: !dev, config: true })
);

if (!dev) {
  plugins.push(
    compiler({
      language_in: "ECMASCRIPT_2019",
      language_out: "ECMASCRIPT_2019",
    })
  );
} else {
  plugins.push({
    name: "watch-external",
    buildStart() {
      this.addWatchFile(path.resolve(__dirname, "web/**/*.css"));
      this.addWatchFile(path.resolve(__dirname, "web/**/*.html"));
      this.addWatchFile(path.resolve(__dirname, "postcss.config.js"));
      this.addWatchFile(path.resolve(__dirname, "tsconfig.json"));
      if (!dev) this.addWatchFile(path.resolve(__dirname, ".env"));
      else this.addWatchFile(path.resolve(__dirname, ".env.dev"));
    },
  });
}

export default {
  input: "web/index.ts",
  output: {
    file: "public/index.js",
    format: "es",
    sourcemap: dev,
    globals: {
      document: "document",
      window: "window",
    },
  },
  // external: (id) => {
  //   return id in deps;
  // },
  plugins,
};
