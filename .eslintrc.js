module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  ignorePatterns: [
    "node_modules/**",
    "public/**",
    "./src/**",
    "data/**",
    "include/**",
    "lib/**",
  ],
  globals: {
    require: true,
  },
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  plugins: ["import", "prettier"],
  overrides: [
    {
      files: ["**/*.ts"],
      env: {
        browser: true,
        es6: true,
        node: true,
      },
      extends: [
        // "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "prettier",
      ],
      globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
      },
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
        project: ["./tsconfig.json", "./tsconfig.eslint.json"],
        compilerOptions: {
          include: ["**/*.ts"],
        },
      },
      plugins: ["@typescript-eslint", "import", "prettier"],
      rules: {
        "@typescript-eslint/no-explicit-any": 0,
        "prettier/prettier": 2,
      },
    },
  ],
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.json",
      },
    },
  },
};
