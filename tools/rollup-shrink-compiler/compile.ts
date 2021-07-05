import { compiler as ClosureCompiler } from "google-closure-compiler";
import {
  RenderedChunk,
  SourceDescription,
  SourceMap,
  SourceMapInput,
} from "rollup";
import { ClosureCompilerOptions } from "./options";

interface ClosureCompilerSource {
  path: string;
  src: string;
  srcmap: string;
}

interface ClosureCompilerOutput {
  src: string;
  source_map: SourceMap;
  path: string;
}

export const compiler = renderHook(compile);

type RenderHookReturn = { code: string; map: SourceMap } | null;
function renderHook<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => Promise<RenderHookReturn> {
  return async (...args: Parameters<T>) => {
    const out = await fn.call(undefined, ...args);
    // console.log("out src map: ", out[0].source_map);
    return {
      code: out[0].src,
      map: out[0].source_map,
    };
  };
}

function compile(
  src: { code: string; name: string; srcmap: string },
  flags: ClosureCompilerOptions
): Promise<ClosureCompilerOutput[]> {
  const sources: ClosureCompilerSource[] = [
    { path: src.name, src: src.code, srcmap: src.srcmap },
  ];

  const compiler = new ClosureCompiler(
    Object.assign({}, flags, {
      json_streams: "BOTH",
    })
  );

  return new Promise((resolve, reject) => {
    const proc = compiler.run((exitCode, stdOut, stdErr) => {
      if (exitCode > 0) {
        reject(stdErr);
      }
      try {
        const parsed = JSON.parse(stdOut);
        resolve(parsed);
      } catch (_) {
        reject("[ClosureCompiler] Could not parse: " + stdOut);
      }
    });
    proc.stdin.end(JSON.stringify(sources));
  });
}
