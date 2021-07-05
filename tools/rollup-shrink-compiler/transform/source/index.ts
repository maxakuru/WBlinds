import {
  InputOptions,
  OutputOptions,
  PluginContext,
  SourceDescription,
} from "rollup";
import { CompilerOptions } from "../../options";
import { SourceTransform } from "./SourceTransform";
import lifecycle from "./lifecycle";
import { Ebbinghaus } from "../ebbinghaus";
import { Mangle } from "../mangle";

export { SourceTransform } from "./SourceTransform";

const TRANSFORMS: Array<typeof SourceTransform> = [];

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
export const create = (
  context: PluginContext,
  options: CompilerOptions,
  mangler: Mangle,
  memory: Ebbinghaus,
  inputOptions: InputOptions,
  outputOptions: OutputOptions
): SourceTransform[] =>
  TRANSFORMS.map(
    (transform) =>
      new transform(context, {}, mangler, memory, inputOptions, outputOptions)
  );

/**
 * Run each transform's `transform` lifecycle.
 * @param code
 * @param transforms
 * @return source code following `transform`
 */
export async function transform(
  source: string,
  id: string,
  transforms: SourceTransform[]
): Promise<SourceDescription> {
  return await lifecycle(id, "Transform", source, transforms);
}
