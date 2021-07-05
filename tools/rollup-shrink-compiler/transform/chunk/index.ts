import {
  OutputOptions,
  PluginContext,
  InputOptions,
  RenderedChunk,
  SourceDescription,
  NormalizedOutputOptions,
} from "rollup";
import { ChunkTransform } from "./ChunkTransform";
import { CompilerOptions } from "../../options";
import { Ebbinghaus } from "../ebbinghaus";
import lifecycle from "./lifecycle";
import StrictTransform from "./strict";
import DynamicImportTransform from "./dynamic-import";
import { Mangle } from "../mangle";
import ExportTransform from "./exports";

export { ChunkTransform } from "./ChunkTransform";

const TRANSFORMS: Array<typeof ChunkTransform> = [
  StrictTransform,
  DynamicImportTransform,
  ExportTransform,
];

/**
 * Instantiate transform class instances for the plugin invocation.
 * @param context Plugin context to bind for each transform instance.
 * @param requestedCompileOptions Originally requested compile options from configuration.
 * @param mangler Mangle instance used for this transform instance.
 * @param memory Ebbinghaus instance used to store information that could be lost from source.
 * @param inputOptions Rollup input options
 * @param outputOptions Rollup output options
 * @return Instantiated transform class instances for the given entry point.
 */
export function create(
  context: PluginContext,
  options: CompilerOptions,
  mangler: Mangle,
  memory: Ebbinghaus,
  inputOptions: InputOptions,
  outputOptions: OutputOptions
): ChunkTransform[] {
  // const pluginOptions = pluckPluginOptions(requestedCompileOptions);
  return TRANSFORMS.map(
    (transform) =>
      new transform(
        context,
        options,
        mangler,
        memory,
        inputOptions,
        outputOptions
      )
  );
}

/**
 * Run each transform's `preCompilation` phase.
 * @param code
 * @param chunk
 * @param transforms
 * @return source code following `preCompilation`
 */
export async function preCompilation(
  source: string,
  chunk: RenderedChunk,
  transforms: ChunkTransform[]
): Promise<SourceDescription> {
  return await lifecycle(
    chunk.fileName,
    "PreCompilation",
    "pre",
    source,
    transforms
  );
}

/**
 * Run each transform's `postCompilation` phase.
 * @param code
 * @param chunk
 * @param transforms
 * @return source code following `postCompilation`
 */
export async function postCompilation(
  code: string,
  chunk: RenderedChunk,
  transforms: ChunkTransform[]
): Promise<SourceDescription> {
  return await lifecycle(
    chunk.fileName,
    "PostCompilation",
    "post",
    code,
    transforms
  );
}
