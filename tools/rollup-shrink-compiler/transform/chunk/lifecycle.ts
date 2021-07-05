import { SourceDescription } from "rollup";
import { ChunkTransform } from "./ChunkTransform";
import { DecodedSourceMap as RemappingDecodedSourceMap } from "@ampproject/remapping/dist/types/types";
import MagicString from "magic-string";
import {
  createDecodedSourceMap,
  createExistingRawSourceMap,
} from "../source-map";

export default async function (
  fileName: string,
  printableName: string,
  method: "pre" | "post",
  code: string,
  transforms: ChunkTransform[]
): Promise<SourceDescription> {
  if (transforms.length === 0) {
    return {
      code: code,
      map: undefined,
    };
  }
  const log: Array<[string, string]> = [];
  const sourcemaps: RemappingDecodedSourceMap[] = [];
  let source = new MagicString(code);
  let finalSource = "";

  log.push(["before", code]);
  try {
    for (const transform of transforms) {
      const transformed = await transform[method](fileName, source);
      const transformedSource = transformed.toString();
      sourcemaps.push(createDecodedSourceMap(transformed, fileName));
      source = new MagicString(transformedSource);
      log.push([transform.name, transformedSource]);
    }
    finalSource = source.toString();
  } catch (e) {
    log.push(["after", finalSource]);
    // await logTransformChain(fileName, printableName, log);

    throw e;
  }

  log.push(["after", finalSource]);
  //   await logTransformChain(fileName, printableName, log);

  return {
    code: finalSource,
    map: createExistingRawSourceMap(sourcemaps, fileName),
  };
}
