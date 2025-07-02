import { defineCollection, z } from "astro:content";

const stories = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),
    summary: z.string(),
  }),
});

export const collections = {
  stories,
};
