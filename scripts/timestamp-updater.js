import fs from "node:fs/promises";
import { isScalar, parseDocument, YAMLMap } from "yaml";

const filenameRegex = /\.(md|mdx)$/;
const contentRegex = /^\uFEFF?\s*(?:---\r?\n([\s\S]*?)\r?\n---\r?\n)?([\s\S]*)$/;
const files = process.argv.slice(2);
const now = new Date();

for (const file of files) {
  if (!file.match(filenameRegex)) continue;

  const inputString = await fs.readFile(file, "utf-8");
  const match = inputString.match(contentRegex);
  if (!match) continue;

  const matter = match[1];
  const body = match[2];
  if (!matter) continue;

  const doc = parseDocument(matter);
  if (!(doc.contents instanceof YAMLMap)) continue;

  const findIndex = (target) => {
    return doc.contents.items.findIndex(({ key }) => isScalar(key) && key.value === target);
  };

  if (doc.has("updateAt")) {
    doc.set("updateAt", now);
  } 
  else if (doc.has("publishAt")) {
    const target = findIndex("publishAt") + 1;
    doc.contents.items.splice(target, 0, doc.createPair("updateAt", now));
  } 
  else {
    const target = findIndex("title") + 1;
    if (target == 0) target = doc.items.length;
    doc.contents.items.splice(target, 0, doc.createPair("publishAt", now));
  }

  const newMatter = doc.toString();
  const outputString = `---\n${newMatter}---\n${body}`;
  await fs.writeFile(file, outputString, "utf-8");
}