import { defineCollection, reference } from "astro:content";
import { glob } from 'astro/loaders';
import { z } from "astro/zod";

const dateSchema = z.coerce.date();
const generateId = ({ entry }: { entry: string }) => {
  const withoutExt = entry.replace(/\.(md|mdx)$/, "");
  return withoutExt
    .split("/")
    .filter((segment, i, arr) =>
      i == arr.length - 1 || !(segment.startsWith("(") && segment.endsWith(")")))
    .join("/");
};

const problems = defineCollection({
  loader: glob({
    base: "src/contents/problems",
    pattern: "**/*.{md,mdx}",
    generateId,
  }),
  schema: z.object({
    title: z.string(),
    publishAt: dateSchema.default(new Date()),
    updateAt: dateSchema.optional(),
    links: z.record(z.string(), z.string()).optional(),
    wip: z.boolean().default(false),
  }),
});

const contests = defineCollection({
  loader: glob({
    base: "src/contents/contests",
    pattern: "**/*.{md,mdx}",
    generateId,
  }),
  schema: z.object({
    title: z.string(),
    contestDate: dateSchema,
    publishAt: dateSchema.default(new Date()),
    updateAt: dateSchema.optional(),
    problems: z.array(reference("problems")),
    links: z.record(z.string(), z.string()).optional(),
    wip: z.boolean().default(false),
  }),
});

const articles = defineCollection({
  loader: glob({
    base: "src/contents/articles",
    pattern: "**/*.{md,mdx}",
    generateId,
  }),
  schema: z.object({
    title: z.string(),
    publishAt: dateSchema.default(new Date()),
    updateAt: dateSchema.optional(),
    links: z.record(z.string(), z.string()).optional(),
    wip: z.boolean().default(false),
  }),
});

export const collections = { problems, contests, articles }