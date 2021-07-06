require("ts-node").register({
  extends: "./tsconfig.json",
  compilerOptions: {
    module: "commonjs",
    baseUrl: ".",
    resolveJsonModule: true,
    moduleResolution: "node",
    esModuleInterop: true,
    paths: {
      "rollup-plugin-serve": ["./tools/@types"],
      "rollup-plugin-svg": ["./tools/@types"],
      "rollup-plugin-html": ["./tools/@types"],
      // "*.html": ["./tools/@types"],
    },
  },
});

module.exports = require("./rollup.config.ts");
