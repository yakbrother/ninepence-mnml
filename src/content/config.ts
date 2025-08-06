import { defineCollection, z } from "astro:content";

const stories = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
    videos: z
      .array(
        z.object({
          platform: z.string(),
          id: z.string(),
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
  }),
});

export const collections = {
  stories,
};
