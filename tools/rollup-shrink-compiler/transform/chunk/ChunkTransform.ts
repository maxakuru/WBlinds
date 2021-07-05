import MagicString from "magic-string";
import { OutputOptions } from "rollup";
import Transform from "../Transform";

export class ChunkTransform extends Transform {
  public name = "ChunkTransform";

  public extern(options: OutputOptions): string | null {
    return null;
  }

  public async pre(
    fileName: string,
    source: MagicString
  ): Promise<MagicString> {
    return source;
  }

  public async post(
    fileName: string,
    source: MagicString
  ): Promise<MagicString> {
    return source;
  }
}
