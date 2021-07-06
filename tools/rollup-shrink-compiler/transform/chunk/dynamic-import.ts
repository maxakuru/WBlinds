import { ChunkTransform } from "./ChunkTransform";
import { CompilerOptions } from "../../options";
import MagicString from "magic-string";
import { walk, parse, isIdentifier } from "../../acorn";
import {
  CallExpression,
  ImportExpression,
  Identifier,
  Literal,
  SimpleCallExpression,
} from "estree";
import { OutputOptions } from "rollup";
import { ITransform } from "../Transform";

const IMPORT_REPLACE_NAME = "__import__";

/**
 * Determines if dynamic imports should be removed then replaced afterwards.
 * @param pluginOptions
 * @param outputOptions
 * @param path
 */
function shouldSkipDynamicImports(
  pluginOptions: CompilerOptions,
  outputOptions: OutputOptions,
  path: string | undefined
): boolean {
  if ("ignoreDynamicImports" in pluginOptions) {
    const remove = pluginOptions.ignoreDynamicImports;
    return remove === undefined || remove === true;
  }

  return false;
}

export default class DynamicImportTransform
  extends ChunkTransform
  implements ITransform
{
  public name = "DynamicImportTransform";

  /**
   * Replace nodes with imports after Closure Compiler pass
   * @param fileName
   * @param source
   * @returns
   */
  public async pre(
    fileName: string,
    source: MagicString
  ): Promise<MagicString> {
    const { file } = this.outputOptions;

    if (
      shouldSkipDynamicImports(this.pluginOptions, this.outputOptions, file)
    ) {
      const program = await parse(fileName, source.toString());
      walk.simple(program, {
        ImportExpression(_node) {
          const node = _node as unknown as ImportExpression;
          const { type, raw } = node.source as Literal;
          const [s, e] = node.range;
          if (type === "Literal") {
            source.remove(s, e);
            source.appendRight(s, `${IMPORT_REPLACE_NAME}(${raw})`);
          }
        },
      });

      return source;
    }

    return source;
  }

  /**
   * Replace nodes with imports after Closure Compiler pass
   * @param fileName
   * @param source
   * @returns
   */
  public async post(
    fileName: string,
    source: MagicString
  ): Promise<MagicString> {
    const { file } = this.outputOptions;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;

    if (
      shouldSkipDynamicImports(this.pluginOptions, this.outputOptions, file)
    ) {
      const program = await parse(fileName, source.toString());
      walk.simple(program, {
        CallExpression(_node) {
          const node = _node as unknown as SimpleCallExpression;
          const {
            callee,
            range: [s, e],
            arguments: args,
          } = node;
          const { name } = callee as Identifier;

          if (name === IMPORT_REPLACE_NAME && isIdentifier(callee)) {
            source.remove(s, e);
            source.appendRight(s, context.getDynamicImportInsert(node));
          }
        },
      });

      return source;
    }

    return source;
  }

  private getDynamicImportInsert(node: SimpleCallExpression) {
    const { file } = this.outputOptions;
    if (this.pluginOptions.dynamicImportReinsertCallback) {
      return this.pluginOptions.dynamicImportReinsertCallback(node, file);
    }

    const { arguments: args } = node;
    return `import(${(args[0] as Literal).raw})`;
  }
}
