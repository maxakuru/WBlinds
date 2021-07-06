import {
  NormalizedInputOptions,
  NormalizedOutputOptions,
  OutputOptions,
} from "rollup";
import path from "path";
import { cwd } from "process";

// TODO: finish these keys
const compilerFlagKeys = [
  "language_in",
  "language_out",
  "compilation_level",
  "env",
  "externs",
  "warning_level",
  "assume_function_wrapper",
  "debug",
  "formatting",
  "isolation_mode",
  "dependency_mode",
  "entry_point",
  "allow_dynamic_import",
  "dynamic_import_alias",
  "module_resolution",
  "process_common_js_modules",
  "package_json_entry_names",
];

export type ClosureLanguage =
  | "ECMASCRIPT3"
  | "ECMASCRIPT5"
  | "ECMASCRIPT5_STRICT"
  | "ECMASCRIPT_2015"
  | "ECMASCRIPT_2016"
  | "ECMASCRIPT_2017"
  | "ECMASCRIPT_2018"
  | "ECMASCRIPT_2019"
  | "ECMASCRIPT_2020"
  | "STABLE"
  | "ECMASCRIPT_NEXT";

/**
 * TODO: finish these
 * Ref: https://github.com/google/closure-compiler/wiki/Flags-and-Options
 */
export interface ClosureCompilerOptions {
  // Basic usage
  /**
   * Default STABLE
   */
  language_in?: ClosureLanguage;
  /**
   * Default STABLE
   */
  language_out?: Exclude<ClosureLanguage, "ECMASCRIPT_NEXT"> | "NO_TRANSPILE";
  /**
   * Default SIMPLE
   */
  compilation_level?: "BUNDLE" | "WHITESPACE_ONLY" | "SIMPLE" | "ADVANCED";
  env?: "BROWSER" | "CUSTOM";
  externs?: string[];

  // Warning and error management
  /**
   * Default DEFAULT
   */
  warning_level?: "QUIET" | "DEFAULT" | "VERBOSE";

  // Output
  /**
   * Default true for es/esm format
   * Default false otherwise
   */
  assume_function_wrapper?: boolean;
  /**
   * Default false
   */
  debug?: boolean;
  formatting?: "PRETTY_PRINT" | "PRINT_INPUT_DELIMITER" | "SINGLE_QUOTES";
  /**
   * Default NONE
   */
  isolation_mode?: "NONE" | "IIFE";

  // Dependency Management
  /**
   * Defaults to PRUNE_LEGACY if entry points are defined, otherwise to NONE.
   */
  dependency_mode?: "NONE" | "SORT_ONLY" | "PRUNE_LEGACY" | "PRUNE";
  entry_point?: string;

  // JS Modules
  allow_dynamic_import?: boolean;
  dynamic_import_alias?: string;
  /**
   * Default BROWSER
   */
  module_resolution?:
    | "BROWSER"
    | "BROWSER_WITH_TRANSFORMED_PREFIXES"
    | "NODE"
    | "WEBPACK";
  /**
   * Default false
   */
  process_common_js_modules?: boolean;
  /**
   * Default ["browser", "module", "main"]
   */
  package_json_entry_names?: string[];

  // Reports
  create_source_map?: string | boolean;

  // Managed
  /**
   * Managed by plugin
   */
  js?: undefined;
  /**
   * Managed by plugin
   */
  js_output_file?: undefined;
  /**
   * Managed by plugin
   */
  json_streams?: undefined;
}

export interface ChunkDescriptor {
  fileName: string;
  source: any;
}

export interface CompilerOptions {
  /**
   * Function that returns a templated file
   */
  templateFunction?: (
    chunkNames: string[]
  ) => ChunkDescriptor[] | Promise<ChunkDescriptor[]>;
  /**
   * Map from input file to other input files that will be loaded first.
   *
   * Avoids creating additional chunks for shared code that you know
   * will be loaded by a prior module.
   */
  implicitChunkLoadOrder?: Record<string, string[]>;

  /**
   * Ignore dynamic imports during Closure Compiler run
   * Default true
   */
  ignoreDynamicImports?: boolean;

  /**
   * Remove `use strict`
   */
  removeStrictDirective?: boolean;
}
export interface CompilerOptionsExtended extends ClosureCompilerOptions {
  options?: CompilerOptions;
}

const DEFAULT_FLAGS: ClosureCompilerOptions = {
  compilation_level: "SIMPLE",
  language_out: "NO_TRANSPILE",
};

/**
 * Get default options.
 * @param incomingFlags
 * @param rollupOptions
 * @returns
 */
export function getDefaultOptions(
  incomingFlags: ClosureCompilerOptions,
  rollupOptions: OutputOptions
): ClosureCompilerOptions {
  const flags = { ...DEFAULT_FLAGS };
  if (isESMFormat(rollupOptions)) {
    flags.assume_function_wrapper = true;
  }
  flags.create_source_map =
    !incomingFlags.create_source_map &&
    (rollupOptions.sourcemap == null || rollupOptions.sourcemap == false)
      ? ""
      : true;

  return flags;
}

/**
 * Get options with default applied
 * and customizations overridden.
 */
export function getOptions(
  incomingFlags: ClosureCompilerOptions,
  pluginOptions: CompilerOptions,
  rollupOptions: OutputOptions
): ClosureCompilerOptions {
  const defaults = getDefaultOptions(incomingFlags, rollupOptions);
  const overrides = { ...incomingFlags };

  if (overrides.externs && Array.isArray(overrides.externs)) {
    overrides.externs = overrides.externs.map((e) => {
      return path.resolve(cwd(), e);
    });
  }

  if (pluginOptions.ignoreDynamicImports) {
    overrides.externs ??= [];
    overrides.externs.push(path.resolve(__dirname, "./import_externs.js"));
  }

  return Object.assign({}, defaults, overrides);
}

export function cleanClosureOptions(
  options: ClosureCompilerOptions
): ClosureCompilerOptions {
  return applyProperties(compilerFlagKeys, {}, options);
}

function applyProperties(keys: string[], target: any, source: any): any {
  keys.forEach((k) => {
    if (k in source) {
      target[k] = source[k];
    }
  });
  return target;
}

/**
 * Checks if output format is ESM
 * @param outputOptions
 * @return boolean
 */
export const isESMFormat = ({ format }: OutputOptions): boolean =>
  format === "esm" || format === "es";
