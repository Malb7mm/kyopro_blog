import { defineCollection, reference } from "astro:content";
import { glob } from 'astro/loaders';
import { z } from "astro/zod";
import { isValid, parse } from "date-fns";
import { ja } from "date-fns/locale";

const dateSchema = z.preprocess((val: any) => {
  if (!(val instanceof Date)) return z.NEVER;
  const isoString = val.toISOString();
  const referenceDate = new Date();
  const result = parse(isoString, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", referenceDate, { locale: ja });
  if (!isValid(result)) return z.NEVER;
  return result;
}, z.date());

const problems = defineCollection({
  loader: glob({
    base: "src/contents/problems",
    pattern: "**/*.{md,mdx}",
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    publishAt: dateSchema,
    updateAt: dateSchema.optional(),
    links: z.record(z.string(), z.string()).optional(),
  }),
});

const contests = defineCollection({
  loader: glob({
    base: "src/contents/contests",
    pattern: "**/*.{md,mdx}",
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    date: dateSchema,
    problems: z.array(reference("problems")),
    links: z.record(z.string(), z.string()).optional(),
  }),
});

export const collections = { problems, contests }