import {
  EmittedFile,
  InputOptions,
  NormalizedInputOptions,
  NormalizedOutputOptions,
  OutputBundle,
  OutputOptions,
  Plugin,
  PluginContext,
  RenderedChunk,
  SourceMap,
  TransformResult,
} from "rollup";
import { compiler } from "./compile";
import {
  cleanClosureOptions,
  ClosureCompilerOptions,
  CompilerOptionsExtended,
  getOptions,
} from "./options";
import {
  createSourceTransforms,
  SourceTransform,
  Ebbinghaus,
  tranformSource,
  createChunkTransforms,
  preCompilation,
  postCompilation,
} from "./transform";

export default function (
  incomingOptions: CompilerOptionsExtended = {}
): Plugin {
  const options = incomingOptions.options || {};
  const chunkLoadOrderMap = options.implicitChunkLoadOrder || {};
  delete incomingOptions.options;
  const flags = cleanClosureOptions(incomingOptions);

  let inputOptions: InputOptions;
  let outputOptions: OutputOptions;
  let refs: string[] = [];

  // transforms
  const memory = new Ebbinghaus();
  let context: PluginContext;
  let sourceTransforms: Array<SourceTransform>;

  return {
    name: "shrink-compile",
    options: (options: InputOptions) => (inputOptions = options),
    outputOptions: (options: OutputOptions) => (outputOptions = options),
    buildStart(opts: NormalizedInputOptions) {
      // console.log("buildStart: ", this, opts);
      context = this;
      sourceTransforms = createSourceTransforms(
        context,
        options,
        // mangler,
        memory,
        inputOptions,
        {}
      );

      if (Array.isArray(inputOptions.input)) {
        /**
         * options: {
         *   implicitLoadOrder?: {
         *     'src/common.ts': [],
         *     'src/module1.ts': ['src/common.ts],
         *     'src/module2.ts': ["src/module1.ts"],
         *   }
         * }
         */
        refs = inputOptions.input.map((o) => {
          const f: EmittedFile = {
            type: "chunk",
            id: o,
          };
          if (o in chunkLoadOrderMap) {
            const arr = chunkLoadOrderMap[o];
            if (
              !Array.isArray(arr) ||
              arr.map((e) => typeof e !== "string").filter((e) => e).length > 0
            ) {
              throw Error(
                "Expecting array of strings for implicitChunkLoadOrder entry value"
              );
            }
            f.implicitlyLoadedAfterOneOf = chunkLoadOrderMap[o];
          }
          return this.emitFile(f);
        });
      }
    },
    transform: async (code: string, id: string): Promise<TransformResult> => {
      if (sourceTransforms.length > 0) {
        const output = await tranformSource(code, id, sourceTransforms);
        return output || null;
      }
      return null;
    },
    renderChunk: async (
      code: string,
      chunk: RenderedChunk,
      nOutOpts: NormalizedOutputOptions
    ) => {
      // console.log(
      //   "[ClosureCompiler] render chunk: ",
      //   chunk,
      //   chunk.name,
      //   outputOptions
      // );

      const renderChunkTransforms = createChunkTransforms(
        context,
        options,
        // mangler,
        memory,
        inputOptions,
        outputOptions
      );
      const preCompileOutput = await preCompilation(
        code,
        chunk,
        renderChunkTransforms
      );

      // console.log("precompile out: ", preCompileOutput);

      const cFlags = getOptions(flags, outputOptions);
      // console.log("precompiled src map: ", preCompileOutput.map);
      const out = await compiler(
        {
          code: preCompileOutput.code,
          srcmap: preCompileOutput.map
            ? preCompileOutput.map.toString()
            : undefined,
          name: chunk.name,
        },
        cFlags
      );

      // console.log("[Compiler] out: ", out);

      const postCompiled = await postCompilation(
        out.code,
        chunk,
        renderChunkTransforms
      );

      // console.log("[Compiler] postCompiled: ", postCompiled);
      return postCompiled;
    },
    generateBundle(
      outputOptions: NormalizedOutputOptions,
      bundle: OutputBundle,
      isWrite: boolean
    ) {
      if (!options.templateFunction) return null;

      let outs: any[];
      try {
        outs = options.templateFunction(refs.map(this.getFileName.bind(this)));
      } catch (e) {
        throw Error("Error in templateFunction: " + e);
      }

      if (!Array.isArray(outs)) {
        throw Error("templateFunction must return array");
      }

      outs.map(({ fileName, source }) => {
        if (typeof fileName !== "string") {
          throw Error("templateFunction must specify output filename");
        }
        if (source == null) {
          throw Error("templateFunction must specify output filename");
        }
        this.emitFile({
          type: "asset",
          fileName: fileName,
          source,
        });
      });
    },
  };
}
