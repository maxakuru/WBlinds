import { ChunkTransform } from "./ChunkTransform";
import MagicString from "magic-string";
import { walk, parse, isIdentifier } from "../../acorn";
import {
  CallExpression,
  Identifier,
  Literal,
  Class,
  Function as ESFunction,
} from "estree";
import { ITransform } from "../Transform";

const IMPORT_REPLACE_NAME = "__import__";

export default class ES6ExportTransform
  extends ChunkTransform
  implements ITransform
{
  public name = "ES6ExportTransform";

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
    const program = await parse(fileName, source.toString());
    const visitor = (_node: unknown) => {
      const node = _node as Class | ESFunction;
      console.log("node: ", node);
      if (node.leadingComments == null) return source;
      console.log("pre node: ", node);
      // const { type, raw } = node.leadingComments as Literal;
      // const [s, e] = node.range;
      // if (type === "Literal") {
      //   source.remove(s, e);
      //   source.appendRight(s, `${IMPORT_REPLACE_NAME}(${raw})`);
      // }
    };

    walk.simple(program, {
      Comment(node) {
        visitor(node);
      },
      Function(node) {
        visitor(node);
      },
    });

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
    const program = await parse(fileName, source.toString());
    const visitor = (_node: unknown) => {
      const node = _node as Class | ESFunction;
      if (node.leadingComments == null) return source;
      console.log("post node: ", node);
      // const { type, raw } = node.leadingComments as Literal;
      // const [s, e] = node.range;
      // if (type === "Literal") {
      //   source.remove(s, e);
      //   source.appendRight(s, `${IMPORT_REPLACE_NAME}(${raw})`);
      // }
    };

    walk.ancestor(program, {
      Class(node) {
        visitor(node);
      },
      Function(node) {
        visitor(node);
      },
    });

    // walk.simple(program, {
    //   CallExpression(_node) {
    //     const node = _node as unknown as CallExpression;
    //     const {
    //       callee,
    //       range: [s, e],
    //       arguments: args,
    //     } = node as CallExpression;
    //     const { name } = callee as Identifier;

    //     if (name === IMPORT_REPLACE_NAME && isIdentifier(callee)) {
    //       source.remove(s, e);
    //       source.appendRight(s, `import(${(args[0] as Literal).raw})`);
    //     }
    //   },
    // });

    return source;
  }
}
