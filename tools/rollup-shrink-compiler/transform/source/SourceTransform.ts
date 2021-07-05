import MagicString from "magic-string";
import Transform from "../Transform";

export class SourceTransform extends Transform {
  public name = "SourceTransform";

  public async transform(
    id: string,
    source: MagicString
  ): Promise<MagicString> {
    return source;
  }
}
