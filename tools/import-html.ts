import { readFile } from "fs/promises";

type InsertableTag = "html" | "body" | "head";
export interface NodeHTMLDoc {
  insertAtEndOf(tag: InsertableTag, content: string): void;
  toString(): string;
  originalContent: string;
}

export default async function importHtml(
  filePath: string
): Promise<NodeHTMLDoc> {
  const originalContent = await readFile(filePath, { encoding: "utf-8" });
  const inserts: Record<InsertableTag, string[]> = {
    html: [],
    head: [],
    body: [],
  };
  return {
    insertAtEndOf: (tag, content) => {
      inserts[tag].push(content);
    },
    toString: () => {
      const lines = originalContent.split("\n");

      const insertables = Object.keys(inserts).reduce(
        (prev, key: InsertableTag) => {
          if (inserts[key].length > 0) {
            prev[key] = inserts[key];
          }
          return prev;
        },
        {} as typeof inserts
      );

      return lines
        .reduce<string[]>((prev, line) => {
          let outLine = line;

          for (const [k, v] of Object.entries(insertables)) {
            const loc = line.indexOf(`</${k}>`);
            if (loc === -1) {
              continue;
            }
            // line has end of insertable
            // find indent preceding the tag for formatting
            let indents = "";
            let i = loc;
            let hasLines = false;
            while (i-- > 0) {
              if (line[i] !== " " && line[i] !== "\t") break;
              indents += line[i];
              if (i === 0 && prev.length > 0) {
                hasLines = true;
              }
            }
            const perIndent = 2;
            const oneIndent = "".padEnd(perIndent, " ");
            // then add it all
            const insertStr = hasLines
              ? oneIndent + v.join(`\n${oneIndent}${indents}`) + `\n${indents}`
              : v.join("");

            outLine =
              line.substr(0, loc) + insertStr + line.substr(loc, line.length);
          }
          return prev.concat(outLine);
        }, [])
        .join("\n");
    },
    originalContent,
  };
}
