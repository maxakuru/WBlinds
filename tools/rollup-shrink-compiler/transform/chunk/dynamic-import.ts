/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ChunkTransform } from "./ChunkTransform";
import { isESMFormat, CompilerOptions } from "../../options";
import MagicString from "magic-string";
import { walk, parse, isIdentifier } from "../../acorn";
import {
  SimpleLiteral,
  CallExpression,
  ImportExpression,
  BaseNode,
  Expression,
  Identifier,
  Literal,
} from "estree";
import { extname } from "path";
import { OutputOptions } from "rollup";
import { ITransform } from "../Transform";
import { LiteralExpression } from "typescript";

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

    if (
      shouldSkipDynamicImports(this.pluginOptions, this.outputOptions, file)
    ) {
      const program = await parse(fileName, source.toString());
      walk.simple(program, {
        CallExpression(_node) {
          const node = _node as unknown as CallExpression;
          const {
            callee,
            range: [s, e],
            arguments: args,
          } = node as CallExpression;
          const { name } = callee as Identifier;

          if (name === IMPORT_REPLACE_NAME && isIdentifier(callee)) {
            source.remove(s, e);
            source.appendRight(s, `import(${(args[0] as Literal).raw})`);
          }
        },
      });

      return source;
    }

    return source;
  }
}
