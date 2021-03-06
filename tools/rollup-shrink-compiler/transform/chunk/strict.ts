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
import { walk, parse } from "../../acorn";
import { ExpressionStatement, SimpleLiteral, Program } from "estree";
import { extname } from "path";
import { OutputOptions } from "rollup";
import { ITransform } from "../Transform";

/**
 * Determines if Strict Mode should be removed from output.
 * @param pluginOptions
 * @param outputOptions
 * @param path
 */
function shouldRemoveStrictModeDeclarations(
  pluginOptions: CompilerOptions,
  outputOptions: OutputOptions,
  path: string | undefined
): boolean {
  if ("removeStrictDirective" in pluginOptions) {
    const removeDirective = pluginOptions["removeStrictDirective"];
    return removeDirective === undefined || removeDirective === true;
  }

  const isESMOutput = !!(path && extname(path) === ".mjs");
  return isESMFormat(outputOptions) || isESMOutput;
}

export default class StrictTransform
  extends ChunkTransform
  implements ITransform
{
  public name = "StrictTransform";

  /**
   * When outputting an es module, runtimes automatically apply strict mode conventions.
   * This means we can safely strip the 'use strict'; declaration from the top of the file.
   * @param code source following closure compiler minification
   * @return code after removing the strict mode declaration (when safe to do so)
   */
  public async post(
    fileName: string,
    source: MagicString
  ): Promise<MagicString> {
    const { file } = this.outputOptions;

    if (
      shouldRemoveStrictModeDeclarations(
        this.pluginOptions,
        this.outputOptions,
        file
      )
    ) {
      const program = await parse(fileName, source.toString());

      walk.simple(program, {
        ExpressionStatement(_node) {
          const node = _node as unknown as ExpressionStatement;
          const { type, value } = node.expression as SimpleLiteral;
          const range = node.range;

          if (type === "Literal" && value === "use strict") {
            source.remove(...range);
          }
        },
      });

      return source;
    }

    return source;
  }
}
