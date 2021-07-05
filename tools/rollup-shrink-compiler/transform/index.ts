/**
 * Ref: https://github.com/ampproject/rollup-plugin-closure-compiler
 */

export {
  create as createSourceTransforms,
  transform as tranformSource,
  SourceTransform,
} from "./source";
export {
  create as createChunkTransforms,
  preCompilation,
  postCompilation,
  ChunkTransform,
} from "./chunk";
export { Ebbinghaus } from "./ebbinghaus";
