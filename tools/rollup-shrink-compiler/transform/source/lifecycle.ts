import { SourceDescription } from "rollup";
import path from "path";
import { SourceTransform } from "./SourceTransform";
import MagicString from "magic-string";
import {
  createDecodedSourceMap,
  createExistingRawSourceMap,
} from "../source-map";
import { DecodedSourceMap as RemappingDecodedSourceMap } from "@ampproject/remapping/dist/types/types";

export default async function (
  id: string,
  printableName: string,
  code: string,
  transforms: SourceTransform[]
): Promise<SourceDescription> {
  const fileName = path.basename(id);
  const log: Array<[string, string]> = [];
  const sourcemaps: RemappingDecodedSourceMap[] = [];
  let source = new MagicString(code);

  log.push(["before", code]);
  for (const transform of transforms) {
    const transformed = await transform.transform(id, source);
    const transformedSource = transformed.toString();
    sourcemaps.push(createDecodedSourceMap(transformed, id));
    source = new MagicString(transformedSource);
    log.push([transform.name, transformedSource]);
  }
  const finalSource = source.toString();

  log.push(["after", finalSource]);
  // await logTransformChain(fileName, printableName, log);

  return {
    code: finalSource,
    map: createExistingRawSourceMap(sourcemaps, fileName),
  };
}
